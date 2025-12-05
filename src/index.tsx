import { Provider } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import axios from "axios";
//@ts-ignore
import { init } from "d2";
import _ from "lodash";
import ReactDOM from "react-dom";
import { D2Api } from "./types/d2-api";
import App from "./webapp/components/app/App";
import "./webapp/utils/wdyr";

declare global {
    interface Window {
        $: { feedbackDhis2(d2: object, appKey: string, feedbackOptions: object): void };
        api: D2Api;
        d2: any;
    }
}

const isDev = process.env.NODE_ENV === "development";

async function getBaseUrl() {
    if (isDev) {
        return "/dhis2"; // See src/setupProxy.js
    } else {
        try {
            const { data: manifest } = await axios.get("manifest.webapp");
            const href = manifest.activities.dhis.href;
            return href === "*" ? ".." : href;
        } catch (error) {
            console.error(error);
            return "..";
        }
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const d2 = await init({
            baseUrl: baseUrl + "/api",
            headers:
                isDev && process.env.REACT_APP_DHIS2_AUTH
                    ? { Authorization: `Basic ${btoa(process.env.REACT_APP_DHIS2_AUTH)}` }
                    : undefined,
            schemas: [],
        });

        const api = new D2Api({ baseUrl, backend: "fetch" });
        if (isDev) window.api = api;

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);

        ReactDOM.render(
            <Provider config={{ baseUrl, apiVersion: 36 }}>
                <App api={api} d2={d2} />
            </Provider>,
            document.getElementById("root")
        );
    } catch (err: any) {
        console.error(err);
        const feedback = err.toString().match("Unable to get schemas") ? (
            <h3 style={{ margin: 20 }}>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
            </h3>
        ) : (
            <h3>{err.toString()}</h3>
        );
        ReactDOM.render(<div>{feedback}</div>, document.getElementById("root"));
    }
}

main();
