import { execSync } from "child_process";
import "dotenv-flow/config";
import fs from "fs";
import { D2Report, D2SqlView } from "../types/d2-api";

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(): Promise<void> {
    const sqlMALDataApproval = fs.readFileSync(
        "src/data/reports/mal-data-approval/sql-views/mal-data-approval-status.sql",
        "utf8"
    );
    const sqlMALDataDiff = fs.readFileSync(
        "src/data/reports/mal-data-approval/sql-views/mal-data-approval-diff.sql",
        "utf8"
    );
    const sqlMALDataHeader = fs.readFileSync(
        "src/data/reports/mal-data-approval/sql-views/mal-data-approval-header.sql",
        "utf8"
    );

    const sqlViews: Partial<D2SqlView>[] = [
        {
            id: "OhWrTIxUdN1",
            name: "MAL Data Approval Status",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlMALDataApproval,
            publicAccess: "--------",
        },
        {
            id: "RZV5DSxqDUc",
            name: "MAL Data approval header",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlMALDataHeader,
            publicAccess: "--------",
        },
        {
            id: "QuNQs2bFGHW",
            name: "MAL Data Approval Diff",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlMALDataDiff,
            publicAccess: "--------",
        },
    ];

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "mal-approval-status" });
    run("yarn build-report");
    const htmlMalDataApproval = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "FQyoZzClRY7",
            name: "Malaria Data Approval Report",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlMalDataApproval,
        },
    ];

    const metadata = {
        sqlViews,
        reports,
    };

    const metadataPath = "dist/metadata.json";
    const metadataJson = JSON.stringify(metadata, null, 4);
    fs.writeFileSync(metadataPath, metadataJson);
    console.debug(`Done: ${metadataPath}`);
}

async function main() {
    try {
        await buildMetadata();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
