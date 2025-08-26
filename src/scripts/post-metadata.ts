import { ArgumentParser } from "argparse";
import "dotenv-flow/config";
import fs from "fs";
import { D2Api } from "../types/d2-api";

export async function postMetadata(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const metadataJson = fs.readFileSync("dist/metadata.json", "utf8");
    const metadata = JSON.parse(metadataJson);
    const res = await api.metadata.post(metadata, { mergeMode: "MERGE" }).getData();
    console.debug(res);
}

async function main() {
    const parser = new ArgumentParser({
        description: "Post metadata (report, sql views) to DHIS2 instance",
    });

    parser.add_argument("-u", "--user-auth", {
        help: "DHIS2 authentication",
        metavar: "USERNAME:PASSWORD",
        default: process.env.REACT_APP_DHIS2_AUTH,
    });

    parser.add_argument("--url", {
        help: "DHIS2 base URL",
        metavar: "URL",
        default: process.env.REACT_APP_DHIS2_BASE_URL,
    });

    try {
        const args = parser.parse_args();
        postMetadata(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
