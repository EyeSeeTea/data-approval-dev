import { ArgumentParser } from "argparse";
import { execSync } from "child_process";
import "dotenv-flow/config";
import fs from "fs";
import _ from "lodash";
import { parse } from "node-html-parser";
import { D2Api, D2Constant, D2Report, D2SqlView, Id, Ref } from "../types/d2-api";

/* dataSetId.dataElementId.cocId */
type EntryId = string;

interface Mapping {
    order: Record<EntryId, number>;
    sections: Record<EntryId, string>;
    sectionNames: Record<string, string>;
}

interface DataSet {
    id: Id;
    name: string;
    formType: string;
    dataEntryForm: { htmlCode: string };
    sections: Array<{ id: Id; name: string; dataElements: DataElement[] }>;
}

interface DataElement {
    id: Id;
    categoryCombo: { categoryOptionCombos: Ref[] };
}
interface Entry {
    dataSetId: Id;
    dataElementId: Id;
    cocId: Id;
    index: number;
    section: { id: string; name: string };
}

function indexEntries<T>(entries: Entry[], fn: (entry: Entry) => T): Record<string, T> {
    return _(entries)
        .map(entry => {
            const key = [entry.dataSetId, entry.dataElementId, entry.cocId].join(".");
            return [key, fn(entry)] as [string, T];
        })
        .fromPairs()
        .value();
}

function getCustomFormEntries(dataSet: DataSet): Entry[] {
    const document = parse(dataSet.dataEntryForm.htmlCode);

    const tabs = document
        .querySelectorAll("#mod2_tabs ul li a")
        .map(aTag => ({ selector: aTag.getAttribute("href"), title: aTag.text }));

    const allEntries: Omit<Entry, "index">[] = _.flatMap(tabs, tab => {
        const inputs = document.querySelectorAll(`${tab.selector} input[name='entryfield']`);

        const entries = inputs.map(input => {
            // <input id="${dataElementId}-${cocId}-val" name="entryfield" ... />
            const [dataElementId, cocId, suffix] = (input.id || "").split("-", 3);
            if (suffix === "val" && dataElementId && cocId) {
                return {
                    dataSetId: dataSet.id,
                    section: { id: cleanString(tab.title), name: tab.title },
                    dataElementId,
                    cocId,
                };
            } else {
                return null;
            }
        });

        return _.compact(entries);
    });

    return enumerate(allEntries);
}

function getSectionEntries(dataSet: DataSet): Entry[] {
    const entries = _.flatMap(dataSet.sections, section => {
        return _.flatMap(section.dataElements, dataElement => {
            // Category option combos are unsorted. For now, this is only used in forms
            // containing YES/NO data elements, so it's not a problem.
            return dataElement.categoryCombo.categoryOptionCombos.map(coc => {
                return {
                    dataSetId: dataSet.id,
                    dataElementId: dataElement.id,
                    cocId: coc.id,
                    section: { id: cleanString(section.name), name: section.name },
                };
            });
        });
    });

    return enumerate(entries);
}

function getMapping(dataSets: DataSet[]): Mapping {
    const entries: Entry[] = _(dataSets)
        .flatMap(dataSet => {
            switch (dataSet.formType) {
                case "CUSTOM":
                    return getCustomFormEntries(dataSet);
                case "SECTION":
                    return getSectionEntries(dataSet);
                default:
                    console.error(`Form type not supported: ${dataSet.formType}`);
                    return [];
            }
        })
        .value();

    const order = indexEntries(entries, entry => entry.index);
    const indexedSections = indexEntries(entries, entry => entry.section);
    const sections = _.mapValues(indexedSections, section => section.id);
    const sectionNames = _(indexedSections)
        .values()
        .map(section => [section.id, section.name] as [string, string])
        .fromPairs()
        .value();

    return { order, sections, sectionNames };
}

const totals = [
    "fEck0UnAFaV",
    "yrP0fOB2Yxv",
    "l1mCEuDf2ZI",
    "h6VJJu0W8U7",
    "MdkO4mttohH",
    "sYJkQfzW1BG",
    "ixpABERkob0",
    "t5jOlOCqSr3",
    "U20BELNfToU",
    "GFfMM55sVzg",
    "v2CCdaKGum8",
    "wrceD1un08Y",
    "o1HqfAPcWtK",
    "MazllecOrQC",
    "ZPgTreSg9Xd",
    "ifKISqV6PJh",
    "P7NeDYkZMDT",
    "HmD6AHanlbO",
    "qfVp6vFGOpZ",
    "qE7bXo1gdhI",
    "Xw3tkU97nlR",
    "WsVBFxzWhi1",
    "nLbuvx5jioD",
    "KGnMzMLw9z0",
    "GuIr410uu6E",
    "qCRmLPzIMfA",
    "iLowQAmnmZK",
];

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const metadata$ = api.metadata.get({
        dataSets: {
            fields: {
                id: true,
                name: true,
                formType: true,
                dataEntryForm: { htmlCode: true },
                sections: {
                    id: true,
                    name: true,
                    dataElements: {
                        id: true,
                        categoryCombo: { categoryOptionCombos: { id: true } },
                    },
                },
            },
            filter: {
                name: { $ilike: "NHWA" },
            },
        },
    });
    const { dataSets } = await metadata$.getData();

    const mapping = getMapping(dataSets);

    const constants: Partial<D2Constant>[] = [
        {
            id: "Du5EM4vlYmp",
            code: "NHWA_COMMENTS",
            name: "NHWA Comments",
            description: JSON.stringify(mapping, null, 2),
            value: 0,
            userGroupAccesses: [
                {
                    access: "r-------",
                    userGroupUid: "DWWxlpQi9M8",
                    displayName: "NHWA Data Clerk",
                    id: "DWWxlpQi9M8",
                },
                {
                    access: "rw------",
                    userGroupUid: "EX00r2JNlQo",
                    displayName: "NHWA administrators",
                    id: "EX00r2JNlQo",
                },
                {
                    access: "r-------",
                    userGroupUid: "xcDZeClzdse",
                    displayName: "NHWA Data Managers",
                    id: "xcDZeClzdse",
                },
            ],
        },
        {
            id: "UPQZeigaTg1",
            code: "NHWA_TOTALS",
            name: "NHWA Totals",
            description: JSON.stringify(totals, null, 2),
            value: 0,
            userGroupAccesses: [
                {
                    access: "r-------",
                    userGroupUid: "DWWxlpQi9M8",
                    displayName: "NHWA Data Clerk",
                    id: "DWWxlpQi9M8",
                },
                {
                    access: "rw------",
                    userGroupUid: "EX00r2JNlQo",
                    displayName: "NHWA administrators",
                    id: "EX00r2JNlQo",
                },
                {
                    access: "r-------",
                    userGroupUid: "xcDZeClzdse",
                    displayName: "NHWA Data Managers",
                    id: "xcDZeClzdse",
                },
            ],
        },
    ];

    const sqlDataComments = fs.readFileSync("src/data/common/sql-views/data-values-with-comments.sql", "utf8");
    const sqlDataApproval = fs.readFileSync("src/data/common/sql-views/data-approval-status.sql", "utf8");

    const sqlViews: Partial<D2SqlView>[] = [
        {
            id: "gCvQF1yeC9f",
            name: "NHWA Data Comments",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlDataComments,
            publicAccess: "--------",
            userGroupAccesses: [
                {
                    access: "r-r-----",
                    userGroupUid: "xcDZeClzdse",
                    displayName: "NHWA Data Managers",
                    id: "xcDZeClzdse",
                },
                {
                    access: "rwrw----",
                    userGroupUid: "EX00r2JNlQo",
                    displayName: "NHWA administrators",
                    id: "EX00r2JNlQo",
                },
                {
                    access: "r-r-----",
                    userGroupUid: "DWWxlpQi9M8",
                    displayName: "NHWA Data Clerk",
                    id: "DWWxlpQi9M8",
                },
            ],
        },
        {
            id: "QTKlHcbGQRh",
            name: "NHWA Data Approval Status",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlDataApproval,
            publicAccess: "--------",
            userGroupAccesses: [
                {
                    access: "r-r-----",
                    userGroupUid: "xcDZeClzdse",
                    displayName: "NHWA Data Managers",
                    id: "xcDZeClzdse",
                },
                {
                    access: "rwrw----",
                    userGroupUid: "EX00r2JNlQo",
                    displayName: "NHWA administrators",
                    id: "EX00r2JNlQo",
                },
                {
                    access: "r-r-----",
                    userGroupUid: "DWWxlpQi9M8",
                    displayName: "NHWA Data Clerk",
                    id: "DWWxlpQi9M8",
                },
            ],
        },
    ];

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "nhwa-comments" });
    run("yarn build-report");
    const htmlComments = fs.readFileSync("dist/index.html", "utf8");

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "nhwa-approval-status" });
    run("yarn build-report");
    const htmlApproval = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "G2pzXQgTMgw",
            name: "NHWA Comments",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlComments,
            publicAccess: "--------",
            userGroupAccesses: [
                {
                    access: "r-------",
                    userGroupUid: "DWWxlpQi9M8",
                    displayName: "NHWA Data Clerk",
                    id: "DWWxlpQi9M8",
                },
                {
                    access: "rw------",
                    userGroupUid: "EX00r2JNlQo",
                    displayName: "NHWA administrators",
                    id: "EX00r2JNlQo",
                },
                {
                    access: "r-------",
                    userGroupUid: "xcDZeClzdse",
                    displayName: "NHWA Data Managers",
                    id: "xcDZeClzdse",
                },
            ],
        },
        {
            id: "klA47Z2KS6s",
            name: "NHWA Data Approval Status",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlApproval,
            publicAccess: "--------",
            userGroupAccesses: [
                {
                    access: "r-------",
                    userGroupUid: "DWWxlpQi9M8",
                    displayName: "NHWA Data Clerk",
                    id: "DWWxlpQi9M8",
                },
                {
                    access: "rw------",
                    userGroupUid: "EX00r2JNlQo",
                    displayName: "NHWA administrators",
                    id: "EX00r2JNlQo",
                },
                {
                    access: "r-------",
                    userGroupUid: "xcDZeClzdse",
                    displayName: "NHWA Data Managers",
                    id: "xcDZeClzdse",
                },
            ],
        },
    ];

    const metadata = {
        sqlViews,
        reports,
        constants,
    };

    const metadataPath = "dist/metadata.json";
    const metadataJson = JSON.stringify(metadata, null, 4);
    fs.writeFileSync(metadataPath, metadataJson);
    console.debug(`Done: ${metadataPath}`);
}

function cleanString(s: string): string {
    return s.replace(/[^\w]*/g, "");
}

function enumerate<T>(objs: Array<T>): Array<T & { index: number }> {
    return objs.map((obj, index) => ({ ...obj, index }));
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
        await buildMetadata(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
