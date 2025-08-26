import _ from "lodash";
import { AppSettings } from "../../domain/common/entities/AppSettings";
import { keyById, NamedRef } from "../../domain/common/entities/Base";
import { Config } from "../../domain/common/entities/Config";
import { ReportType } from "../../domain/common/entities/ReportType";
import { User, UserDataSetAction } from "../../domain/common/entities/User";
import { ConfigRepository } from "../../domain/common/repositories/ConfigRepository";
import { D2Api, Id } from "../../types/d2-api";
import { Maybe } from "../../types/utils";
import { getReportType } from "../../webapp/utils/reportType";
import { approvalReportAccess } from "../ApprovalReportData";
import { D2ApprovalReport } from "../D2ApprovalReport";
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
    private d2ApprovalReport: D2ApprovalReport;

    constructor(private api: D2Api, private type: ReportType) {
        this.d2ApprovalReport = new D2ApprovalReport();
    }

    async get(): Promise<Config> {
        const appSettings = this.d2ApprovalReport.get();
        const { dataSets, sqlViews: existedSqlViews, dataApprovalWorkflows } = await this.getMetadata(appSettings);
        const currentUser = await this.getCurrentUser();
        const userGroups = currentUser.userGroups.map(group => group.name);
        const dataSetsToShow = _(dataSets)
            .map(d2DataSet => {
                const dataSetAccess = approvalReportAccess.dataSets[d2DataSet.code];
                if (!dataSetAccess) return undefined;

                if (currentUser.isAdmin) return d2DataSet;

                return _(dataSetAccess.read.userGroups).intersection(userGroups).value().length > 0
                    ? d2DataSet
                    : undefined;
            })
            .compact()
            .value();

        const filteredDataSets = getFilteredDataSets(dataSets);

        const sqlViews = existedSqlViews.reduce((acc, sqlView) => {
            return { ...acc, [sqlView.name]: sqlView };
        }, {});

        const pairedDataElements = getPairedMapping(filteredDataSets);
        const orgUnitList = getPairedOrgunitsMapping(filteredDataSets);
        const currentYear = new Date().getFullYear();
        return {
            dataSets: keyById(dataSetsToShow),
            currentUser: {
                ...currentUser,
                dataSets: _(dataSetsToShow)
                    .map((dataSet): Maybe<D2UserDataSetAccess> => {
                        const accessDataSet = approvalReportAccess.dataSets[dataSet.code];
                        if (!accessDataSet) return undefined;
                        return [
                            dataSet.id,
                            {
                                complete:
                                    _(accessDataSet.complete.userGroups).intersection(userGroups).value().length > 0,
                                incomplete:
                                    _(accessDataSet.incomplete.userGroups).intersection(userGroups).value().length > 0,
                                monitoring:
                                    _(accessDataSet.monitoring.userGroups).intersection(userGroups).value().length > 0,
                                read: _(accessDataSet.read.userGroups).intersection(userGroups).value().length > 0,
                                revoke: _(accessDataSet.revoke.userGroups).intersection(userGroups).value().length > 0,
                                submit: _(accessDataSet.submit.userGroups).intersection(userGroups).value().length > 0,
                                approve:
                                    _(accessDataSet.approve.userGroups).intersection(userGroups).value().length > 0,
                            },
                        ];
                    })
                    .compact()
                    .fromPairs()
                    .value(),
            },
            sqlViews,
            pairedDataElementsByDataSet: pairedDataElements,
            orgUnits: orgUnitList,
            sections: undefined,
            sectionsByDataSet: undefined,
            years: _.range(currentYear - 10, currentYear + 1).map(n => n.toString()),
            approvalWorkflow: dataApprovalWorkflows,
            appSettings: appSettings,
        };
    }

    private async getDataSetsConfigured(): Promise<AppSettings["dataSets"]> {
        const appSettings = this.d2ApprovalReport.get();

        const dataSetsCodes = Object(appSettings.dataSets).keys();

        if (dataSetsCodes.length === 0) throw new Error("No data sets configured");

        const response = await this.api.models.dataSets
            .get({
                fields: {
                    id: true,
                    code: true,
                    displayName: toName,
                    dataSetElements: { dataElement: { id: true, name: true } },
                    organisationUnits: { id: true },
                },
                filter: { code: { in: dataSetsCodes } },
            })
            .getData();

        return _(response.objects)
            .map(d2DataSet => {
                const currentDataSet = appSettings.dataSets[d2DataSet.code];
                if (!currentDataSet) {
                    console.warn(`No dataSet config. found with code: ${d2DataSet.code}`);
                    return undefined;
                }

                return [d2DataSet.code, currentDataSet];
            })
            .compact()
            .fromPairs()
            .value();
    }

    getMetadata(appSettings: AppSettings) {
        const dataSetCodes = Object.keys(appSettings.dataSets);
        if (dataSetCodes.length === 0) throw new Error("No data sets configured");

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
                filter: { code: { in: dataSetCodes } },
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
                    dataViewOrganisationUnits: {
                        id: true,
                        displayName: toName,
                        path: true,
                        level: true,
                    },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true, authorities: true },
                    },
                    userGroups: { id: true, name: true },
                },
            })
            .getData();

        return {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: d2User.dataViewOrganisationUnits.map(ou => ({ ...ou, children: [] })),
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

type D2UserDataSetAccess = [string, UserDataSetAction];
