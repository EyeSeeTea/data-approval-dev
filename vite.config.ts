/// <reference types="vitest/config" />
import { ConfigEnv, Plugin, UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import * as path from "path";

export default ({ mode }: ConfigEnv): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const proxy = getProxy(env);

    // https://vitejs.dev/config/
    return defineConfig({
        base: "", // Relative paths
        plugins: [
            // md5.js (a direct dependency) uses Buffer, so the browser build needs Node stdlib shims.
            nodePolyfills({ overrides: { fs: path.resolve(__dirname, "vite-stubs/fs.js") } }),
            react(),
            redirectPaths(env),
            !isTest &&
                checker({
                    overlay: false,
                    typescript: true,
                    // ESLint is not run by the checker: vite-plugin-checker >= 0.9 hands ESLint a flat config,
                    // which the legacy ESLint of this app rejects. Lint with `yarn lint`.
                }),
        ],
        test: {
            environment: "jsdom",
            include: ["**/*.spec.{ts,tsx}"],
            setupFiles: "./src/tests/setup.ts",
            exclude: ["**/node_modules/**"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT),
            proxy: proxy,
        },
    });
};

function getProxy(env: Record<string, string>) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar];
    const isBuild = env.NODE_ENV === "production";

    if (isBuild) {
        return {};
    } else if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar}`);
        process.exit(1);
    } else if (!auth) {
        console.error(`Set ${dhis2AuthVar}`);
        process.exit(1);
    } else {
        return {
            "/dhis2": {
                target: targetUrl,
                changeOrigin: true,
                auth: auth,
                rewrite: (requestPath: string) => requestPath.replace(/^\/dhis2/, ""),
            },
        };
    }
}

// Some apps (i.e. Pivot Table) do not work through the proxy. Typically, these links are rendered
// on iframed dashboards, so redirect them to the original DHIS2 URL.
const redirectPathsList = ["/dhis-web-pivot", "/dhis-web-data-visualizer"];

function redirectPaths(env: Record<string, string>): Plugin {
    return {
        name: "redirect-dhis2-apps",
        configureServer(server) {
            const targetUrl = (env.VITE_DHIS2_BASE_URL || "").replace(/\/$/, "");

            server.middlewares.use((req, res, next) => {
                const path = (req.url || "").replace(/^\/dhis2\//, "/");
                const shouldRedirect =
                    targetUrl &&
                    (req.url || "").startsWith("/dhis2/") &&
                    redirectPathsList.some(redirectPath => path.startsWith(redirectPath));

                if (shouldRedirect) {
                    res.writeHead(302, { Location: targetUrl + path });
                    res.end();
                } else {
                    next();
                }
            });
        },
    };
}

const isTest = process.env.VITEST;
