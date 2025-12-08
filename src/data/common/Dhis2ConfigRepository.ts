import _ from "lodash";
import { keyById, NamedRef } from "../../domain/common/entities/Base";
import { Config } from "../../domain/common/entities/Config";
import { ReportType } from "../../domain/common/entities/ReportType";
import { User } from "../../domain/common/entities/User";
import { ConfigRepository } from "../../domain/common/repositories/ConfigRepository";
import { D2Api, Id } from "../../types/d2-api";
import { getReportType } from "../../webapp/utils/reportType";
import { malDataSetCodes } from "../reports/mal-data-approval/constants/MalDataApprovalConstants";

export const SQL_VIEW_DATA_COMMENTS_NAME = "NHWA Data Comments";
export const SQL_VIEW_DATA_APPROVAL_NAME = "NHWA Data Approval Status";

export const SQL_VIEW_DATA_DUPLICATION_NAME = "MAL Data Approval Status";
export const SQL_VIEW_OLD_DATA_DUPLICATION_NAME = "MAL Data Approval Status Pre 2000";
export const SQL_VIEW_MAL_METADATA_NAME = "MAL Data approval header";
export const SQL_VIEW_MAL_DIFF_NAME = "MAL Data Approval Diff";
export const SQL_VIEW_NHWA_SUBNATIONAL_CORRECT = "NHWA Module 1 Subnational correct org unit name";

type BaseConfigType = {
    dataSets: { namePrefix: string | undefined; nameExcluded: RegExp | string | undefined; codes?: string[] };
    sqlViewNames: string[];
    constantCode: string;
    approvalWorkflows: { namePrefix: string };
};

const base: Record<ReportType, BaseConfigType> = {
    nhwa: {
        dataSets: { namePrefix: "NHWA", nameExcluded: /old$/ },
        sqlViewNames: [SQL_VIEW_DATA_COMMENTS_NAME, SQL_VIEW_DATA_APPROVAL_NAME, SQL_VIEW_NHWA_SUBNATIONAL_CORRECT],
        constantCode: "NHWA_COMMENTS",
        approvalWorkflows: { namePrefix: "NHWA" },
    },
    mal: {
        dataSets: {
            namePrefix: undefined,
            nameExcluded: undefined,
            codes: Object.values(malDataSetCodes),
        },
        sqlViewNames: [
            SQL_VIEW_DATA_DUPLICATION_NAME,
            SQL_VIEW_MAL_METADATA_NAME,
            SQL_VIEW_MAL_DIFF_NAME,
            SQL_VIEW_OLD_DATA_DUPLICATION_NAME,
        ],
        constantCode: "",
        approvalWorkflows: { namePrefix: "MAL" },
    },
    "mal-subscription": {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    glass: {
        dataSets: { namePrefix: "AMR", nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "AMR" },
    },
    "glass-admin": {
        dataSets: { namePrefix: "AMR", nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "AMR" },
    },
    auditEmergency: {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    auditTrauma: {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    "summary-patient": {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    "summary-mortality": {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    authMonitoring: {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    "data-quality": {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
    twoFactorUserMonitoring: {
        dataSets: { namePrefix: undefined, nameExcluded: undefined },
        sqlViewNames: [],
        constantCode: "",
        approvalWorkflows: { namePrefix: "" },
    },
};

export class Dhis2ConfigRepository implements ConfigRepository {
    constructor(private api: D2Api, private _type: ReportType) {}

    async get(): Promise<Config> {
        const { serverTimeZoneId } = await this.api.system.info.getData();
        const { dataSets, sqlViews: existedSqlViews, dataApprovalWorkflows } = await this.getMetadata();
        const currentUser = await this.getCurrentUser();

        const filteredDataSets = getFilteredDataSets(dataSets);

        const sqlViews = existedSqlViews.reduce((acc, sqlView) => {
            return { ...acc, [sqlView.name]: sqlView };
        }, {});

        const pairedDataElements = getPairedMapping(filteredDataSets);
        const orgUnitList = getPairedOrgunitsMapping(filteredDataSets);
        const currentYear = new Date().getFullYear();
        return {
            timeZoneId: serverTimeZoneId,
            dataSets: keyById(dataSets),
            currentUser: currentUser,
            sqlViews,
            pairedDataElementsByDataSet: pairedDataElements,
            orgUnits: orgUnitList,
            sections: undefined,
            sectionsByDataSet: undefined,
            years: _.range(currentYear - 10, currentYear + 1).map(n => n.toString()),
            approvalWorkflow: dataApprovalWorkflows,
        };
    }

    getMetadata() {
        const { constantCode, sqlViewNames, approvalWorkflows } = base.mal;

        const metadata$ = this.api.metadata.get({
            dataSets: {
                fields: {
                    id: true,
                    code: true,
                    displayName: toName,
                    dataSetElements: {
                        dataElement: { id: true, name: true },
                    },
                    organisationUnits: { id: true },
                },
                filter: { code: { in: [] } },
            },
            constants: {
                fields: { description: true },
                filter: { code: { eq: constantCode } },
            },
            sqlViews: {
                fields: { id: true, name: true },
                filter: { name: { in: sqlViewNames } },
            },
            dataApprovalWorkflows: {
                fields: { id: true, name: true },
                filter: { name: { $ilike: approvalWorkflows.namePrefix } },
            },
        });

        return metadata$.getData();
    }

    async getCurrentUser(): Promise<User> {
        const d2User = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    organisationUnits: userOrgUnitFields,
                    dataViewOrganisationUnits: userOrgUnitFields,
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true, authorities: true },
                    },
                    userGroups: { id: true, name: true, code: true },
                },
            })
            .getData();

        const viewOrgUnits = d2User.dataViewOrganisationUnits.map(ou => ({ ...ou, children: ou.children }));
        const writeOrgUnits = d2User.organisationUnits.map(ou => ({ ...ou, children: ou.children }));

        const orgUnits = _(viewOrgUnits)
            .concat(writeOrgUnits)
            .filter(ou => ou.level <= 3)
            .unionBy(ou => ou.id)
            .value();

        return {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: orgUnits,
            userGroups: d2User.userGroups,
            ...d2User.userCredentials,
            isAdmin: d2User.userCredentials.userRoles.some(role => role.authorities.includes("ALL")),
        };
    }
}

interface DataSet {
    id: Id;
    dataSetElements: Array<{ dataElement: NamedRef }>;
    organisationUnits: Array<{ id: Id }>;
}

function getNameOfDataElementWithValue(name: string): string {
    const s = "NHWA_" + name.replace(/NHWA_Comment of /, "");
    return s.replace(" - ", " for ");
}

function getCleanName(name: string): string {
    return name
        .replace(/[^\w]$/, "") // Remove trailing non-alphanumic characters
        .replace(/\s+/g, " ") // Replace &nbps (x160) characters by normal spaces
        .trim()
        .toLowerCase();
}

function getPairedMapping(dataSets: DataSet[]): Config["pairedDataElementsByDataSet"] {
    const dataElementsByName = _(dataSets)
        .flatMap(dataSet => dataSet.dataSetElements)
        .map(dse => dse.dataElement)
        .keyBy(de => getCleanName(de.name))
        .value();

    return _(dataSets)
        .map(dataSet => {
            const mapping = getMappingForDataSet(dataSet, dataElementsByName);
            return [dataSet.id, mapping] as [string, typeof mapping];
        })
        .fromPairs()
        .value();
}

function getPairedOrgunitsMapping(dataSets: DataSet[]) {
    const orgUnitList = _(dataSets)
        .flatMap(dataSet => dataSet.organisationUnits)
        .map(ou => ou.id)
        .value();

    return orgUnitList;
}

function getMappingForDataSet(dataSet: DataSet, dataElementsByName: Record<string, NamedRef>) {
    return _(dataSet.dataSetElements)
        .map(dse => dse.dataElement)
        .filter(de => de.name.startsWith("NHWA_Comment of"))
        .map(de => {
            const name = getNameOfDataElementWithValue(de.name);
            const cleanName = getCleanName(name);
            const valueDataElement = dataElementsByName[cleanName];
            if (!valueDataElement) {
                console.error(`Value data element not found for comment:\n  ${name}`);
                return null;
            } else {
                return { dataValueVal: valueDataElement.id, dataValueComment: de.id };
            }
        })
        .compact()
        .value();
}

function getFilteredDataSets<DataSet extends NamedRef>(dataSets: DataSet[]): DataSet[] {
    const type = getReportType();
    const { namePrefix, nameExcluded } = base[type].dataSets;

    if (!namePrefix || !nameExcluded) return dataSets;
    return dataSets.filter(({ name }) => name.startsWith(namePrefix) && !name.match(nameExcluded));
}

const toName = { $fn: { name: "rename", to: "name" } } as const;

const userOrgUnitFields = {
    id: true,
    displayName: toName,
    path: true,
    level: true,
    children: { id: true, displayName: toName, path: true, level: true },
} as const;
