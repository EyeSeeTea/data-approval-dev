import { execSync } from "child_process";
import "dotenv-flow/config";

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function build(): Promise<void> {
    const report = process.env.REACT_APP_REPORT_VARIANT;
    console.debug(`Report type: ${report}`);
    console.debug("Building DHIS2 Approval Report");
    run("yarn mal-build");
}

async function main() {
    try {
        await build();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
