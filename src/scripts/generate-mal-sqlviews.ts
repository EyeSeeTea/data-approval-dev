import "dotenv-flow/config";
import fs from "fs";
import { ArgumentParser } from "argparse";
import { D2Api } from "../types/d2-api";
import { SQL_VIEW_MAL_METADATA_NAME } from "../data/common/Dhis2ConfigRepository";

const headerSqlViewPath = "src/data/reports/mal-data-approval/sql-views/mal-data-approval-header.sql";
const defaultHeaderSqlViewId = "RZV5DSxqDUc";

async function main() {
    const parser = new ArgumentParser({
        description: `Create or update the "${SQL_VIEW_MAL_METADATA_NAME}" SQL view shared by all datasets`,
    });

    parser.add_argument("--post", {
        help: "Commit changes to DHIS2 (default: validate only)",
        default: false,
        action: "store_true",
    });

    try {
        const args = parser.parse_args();
        const baseUrl = process.env.REACT_APP_DHIS2_BASE_URL || "";
        const authString = process.env.REACT_APP_DHIS2_AUTH || "";

        const [username, password] = authString.split(":", 2);
        if (!username || !password) throw new Error("Invalid DHIS2 authentication");

        const api = new D2Api({ agent: {}, baseUrl, auth: { username, password } });

        await saveHeaderSqlView(api, args.post);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function saveHeaderSqlView(api: D2Api, commit: boolean): Promise<void> {
    const existingSqlViews = await api.models.sqlViews
        .get({ filter: { name: { eq: SQL_VIEW_MAL_METADATA_NAME } }, paging: false, fields: { $owner: true } })
        .getData();

    const existingSqlView = existingSqlViews.objects[0];

    const sqlView = {
        ...(existingSqlView || {}),
        id: existingSqlView?.id ?? defaultHeaderSqlViewId,
        name: SQL_VIEW_MAL_METADATA_NAME,
        sqlQuery: fs.readFileSync(headerSqlViewPath, "utf8"),
        type: "QUERY" as const,
        cacheStrategy: "RESPECT_SYSTEM_SETTING" as const,
    };

    const importMode = commit ? "COMMIT" : "VALIDATE";
    const response = await api.metadata.post({ sqlViews: [sqlView] }, { importMode }).getData();

    console.debug(
        `SQL view "${sqlView.name}" (${sqlView.id}) ${
            commit ? "saved" : "validated"
        } in DHIS2. Response: ${JSON.stringify(response.stats)}`
    );
}

main();
