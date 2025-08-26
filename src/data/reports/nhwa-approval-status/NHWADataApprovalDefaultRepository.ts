import _ from "lodash";
import { getSqlViewId } from "../../../domain/common/entities/Config";
import {
    DataApprovalItem,
    DataApprovalItemIdentifier,
} from "../../../domain/reports/nhwa-approval-status/entities/DataApprovalItem";
import {
    NHWADataApprovalRepository,
    NHWADataApprovalRepositoryGetOptions,
} from "../../../domain/reports/nhwa-approval-status/repositories/NHWADataApprovalRepository";
import { D2Api, Id, PaginatedObjects } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { SQL_VIEW_DATA_APPROVAL_NAME } from "../../common/Dhis2ConfigRepository";
import { Dhis2SqlViews } from "../../common/Dhis2SqlViews";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";

interface Variables {
    orgUnitRoot: string;
    dataSets: string;
    orgUnits: string;
    periods: string;
    completed: string;
    approved: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlField =
    | "datasetuid"
    | "dataset"
    | "orgunituid"
    | "orgunit"
    | "period"
    | "attribute"
    | "approvalworkflowuid"
    | "approvalworkflow"
    | "completed"
    | "validated"
    | "lastupdatedvalue";

const fieldMapping: Record<keyof DataApprovalItem, SqlField> = {
    dataSetUid: "datasetuid",
    dataSet: "dataset",
    orgUnitUid: "orgunit",
    orgUnit: "orgunit",
    period: "period",
    attribute: "attribute",
    approvalWorkflowUid: "approvalworkflowuid",
    approvalWorkflow: "approvalworkflow",
    completed: "completed",
    validated: "validated",
    lastUpdatedValue: "lastupdatedvalue",
};

export class NHWADataApprovalDefaultRepository implements NHWADataApprovalRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(options: NHWADataApprovalRepositoryGetOptions): Promise<PaginatedObjects<DataApprovalItem>> {
        const { config, dataSetIds, orgUnitIds, periods } = options; // ?
        const { paging, sorting } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const sqlViews = new Dhis2SqlViews(this.api);

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                getSqlViewId(config, SQL_VIEW_DATA_APPROVAL_NAME),
                {
                    orgUnitRoot: sqlViewJoinIds(config.currentUser.orgUnits.map(({ id }) => id)),
                    orgUnits: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(periods),
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                    completed: options.completionStatus ?? "-",
                    approved: options.approvalStatus ?? "-",
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).
        const items: Array<DataApprovalItem> = rows.map(item => {
            return {
                dataSetUid: item.datasetuid,
                dataSet: item.dataset,
                orgUnitUid: item.orgunituid,
                orgUnit: item.orgunit,
                period: item.period,
                attribute: item.attribute,
                approvalWorkflowUid: item.approvalworkflowuid,
                approvalWorkflow: item.approvalworkflow,
                completed: toBoolean(item.completed),
                validated: toBoolean(item.validated),
                lastUpdatedValue: item.lastupdatedvalue,
            };
        });

        return { pager, objects: items };
    }

    async save(filename: string, dataSets: DataApprovalItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = dataSets.map(
            (dataSet): DataSetRow => ({
                dataSet: dataSet.dataSet,
                orgUnit: dataSet.orgUnit,
                period: dataSet.period,
                completed: String(dataSet.completed),
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }

    async complete(dataSets: DataApprovalItemIdentifier[]): Promise<boolean> {
        const completeDataSetRegistrations = dataSets.map(ds => ({
            dataSet: ds.dataSet,
            period: ds.period,
            organisationUnit: ds.orgUnit,
            completed: true,
        }));

        try {
            const response = await this.api
                .post<{ status: "OK" | "ERROR"; response: { status: "SUCCESS" | "ERROR" } }>(
                    "/completeDataSetRegistrations",
                    {},
                    { completeDataSetRegistrations }
                )
                .getData();

            return response.response.status === "SUCCESS";
        } catch (error: any) {
            return false;
        }
    }

    async approve(dataSets: DataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const uniqueDataSets = this.getUniqueWorkFlows(dataSets);

            const response = await promiseMap(uniqueDataSets, async approval => {
                const approvalResponse = await this.getWorkFlowStatus(approval);
                if (approvalResponse.mayApprove) {
                    return this.api
                        .post<any>(
                            "/dataApprovals",
                            { wf: approval.workflow, pe: approval.period, ou: approval.orgUnit },
                            {}
                        )
                        .getData();
                } else {
                    return true;
                }
            });
            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async incomplete(dataSets: DataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const response = await promiseMap(dataSets, item =>
                this.api
                    .delete<string>("/completeDataSetRegistrations", {
                        ds: item.dataSet,
                        pe: item.period,
                        ou: item.orgUnit,
                    })
                    .getData()
            );

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async unapprove(dataSets: DataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const uniqueDataSets = this.getUniqueWorkFlows(dataSets);
            const response = await promiseMap(uniqueDataSets, async approval => {
                const approvalResponse = await this.getWorkFlowStatus(approval);
                if (approvalResponse.mayUnapprove) {
                    return this.api
                        .delete<any>("/dataApprovals", {
                            wf: approval.workflow,
                            pe: approval.period,
                            ou: approval.orgUnit,
                        })
                        .getData();
                } else {
                    return true;
                }
            });

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    private async getWorkFlowStatus(approval: DataApprovalItemIdentifier): Promise<DataApproval> {
        try {
            const approvalResponse = await this.api
                .request<DataApproval>({
                    url: "/dataApprovals",
                    method: "get",
                    params: { wf: approval.workflow, pe: approval.period, ou: approval.orgUnit },
                })
                .getData();

            return approvalResponse;
        } catch (error) {
            throw new Error(
                `Error getting workflow status: ${approval.workflow}-${approval.dataSet}-${approval.period}-${approval.orgUnit}`
            );
        }
    }

    private getUniqueWorkFlows(dataSets: DataApprovalItemIdentifier[]): DataApprovalItemIdentifier[] {
        return _(dataSets)
            .uniqBy(ds => `${ds.workflow}.${ds.period}.${ds.orgUnit}`)
            .value();
    }

    async getColumns(): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS);

        return columns ?? [];
    }

    async saveColumns(columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS, columns);
    }
}

const csvFields = ["dataSet", "orgUnit", "period", "completed"] as const;

type CsvField = typeof csvFields[number];

type DataSetRow = Record<CsvField, string>;

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}

function toBoolean(str: string): boolean {
    return str === "true";
}

type DataApproval = {
    mayApprove: boolean;
    mayUnapprove: boolean;
    mayAccept: boolean;
    mayUnaccept: boolean;
    mayReadData: boolean;
};
