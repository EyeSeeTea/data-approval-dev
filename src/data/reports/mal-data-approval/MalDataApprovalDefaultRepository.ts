import _ from "lodash";
import {
    D2Api,
    DataValueSetsPostResponse,
    Id,
    PaginatedObjects,
    DataValueSetsPostRequest,
} from "../../../types/d2-api";
import { promiseMap, promiseMapConcurrent } from "../../../utils/promises";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Dhis2SqlViews, SqlViewGetData } from "../../common/Dhis2SqlViews";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { getSqlViewId } from "../../../domain/common/entities/Config";
import { SQL_VIEW_MAL_METADATA_NAME } from "../../common/Dhis2ConfigRepository";
import {
    MalDataApprovalItem,
    MalDataApprovalItemIdentifier,
} from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import {
    MalDataApprovalOptions,
    MalDataApprovalRepository,
} from "../../../domain/reports/mal-data-approval/repositories/MalDataApprovalRepository";
import { DataDiffItemIdentifier } from "../../../domain/reports/mal-data-approval/entities/DataDiffItem";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { emptyPage, paginate } from "../../../domain/common/entities/PaginatedObjects";
import { MalDataSet } from "./constants/MalDataApprovalConstants";
import { getMetadataByIdentifiableToken } from "../../common/utils/getMetadataByIdentifiableToken";
import { Maybe } from "../../../types/utils";
import { DataValueStats } from "../../../domain/common/entities/DataValueStats";
import { approvalReportSettings } from "../../ApprovalReportData";
import { DATA_ELEMENT_SUFFIX } from "../../../domain/common/entities/AppSettings";

interface VariableHeaders {
    dataSets: string;
}
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

type SqlFieldHeaders = "datasetuid" | "dataset" | "orgunituid" | "orgunit" | "orgunitcode";

type CompleteDataSetRegistrationsType = {
    completeDataSetRegistrations: [
        {
            period?: string;
            dataSet?: string;
            organisationUnit?: string;
            attributeOptionCombo?: string;
            date?: string;
            storedBy?: string;
            completed?: boolean;
        }
    ];
};

type CompleteCheckResponseType = CompleteDataSetRegistrationsType[];

type DataElementsType = { id: string; name: string };

type DataSetElementsType = { dataElement: DataElementsType };

type DataValueType = {
    dataElement: string;
    period: string;
    orgUnit: string;
    value: string;
    [key: string]: string;
};

type DataSetsValueType = {
    dataSet: string;
    period: string;
    orgUnit: string;
    completeDate?: string;
    dataValues: DataValueType[];
};

type DataElementMapping = {
    origId: string;
    destId: string;
    name?: string;
};

type SqlField =
    | "datasetuid"
    | "dataset"
    | "orgunituid"
    | "orgunit"
    | "orgunitcode"
    | "period"
    | "attribute"
    | "approvalworkflowuid"
    | "approvalworkflow"
    | "completed"
    | "validated"
    | "approved"
    | "lastupdatedvalue"
    | "lastdateofsubmission"
    | "lastdateofapproval"
    | "diff"
    | "monitoring";

const fieldMapping: Record<keyof MalDataApprovalItem, SqlField> = {
    dataSetUid: "datasetuid",
    dataSet: "dataset",
    orgUnitUid: "orgunit",
    orgUnit: "orgunit",
    orgUnitCode: "orgunitcode",
    period: "period",
    attribute: "attribute",
    approvalWorkflowUid: "approvalworkflowuid",
    approvalWorkflow: "approvalworkflow",
    completed: "completed",
    validated: "validated",
    approved: "approved",
    lastUpdatedValue: "lastupdatedvalue",
    lastDateOfSubmission: "lastdateofsubmission",
    lastDateOfApproval: "lastdateofapproval",
    modificationCount: "diff",
    monitoring: "monitoring",
};

export class MalDataApprovalDefaultRepository implements MalDataApprovalRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(options: MalDataApprovalOptions): Promise<PaginatedObjects<MalDataApprovalItem>> {
        const {
            isApproved,
            approvalStatus,
            completionStatus,
            config,
            dataSetId,
            orgUnitIds,
            periods,
            sorting,
            useOldPeriods,
            modificationCount,
        } = options;
        if (!dataSetId) return emptyPage;
        const dataSetResponse = await this.api.models.dataSets
            .get({ fields: { id: true, code: true }, filter: { id: { eq: dataSetId } } })
            .getData();

        const dataSet = dataSetResponse.objects[0];
        if (!dataSet) throw new Error(`Data set not found for ID: ${dataSetId}`);

        const sqlViews = new Dhis2SqlViews(this.api);
        const pagingToDownload = { page: 1, pageSize: 10000 };
        const dataSetSettings = config.appSettings.dataSets[dataSet.code];
        if (!dataSetSettings) throw new Error(`Data set settings not found for ID: ${dataSetId}`);

        const sqlVariables = {
            orgUnitRoot: sqlViewJoinIds(config.currentUser.orgUnits.map(({ id }) => id)),
            orgUnits: sqlViewJoinIds(orgUnitIds),
            periods: sqlViewJoinIds(periods),
            dataSets: dataSetId,
            completed: completionStatus === undefined ? "-" : completionStatus ? "true" : "-",
            approved: approvalStatus === undefined ? "-" : approvalStatus.toString(),
            orderByColumn: fieldMapping[sorting.field],
            orderByDirection: sorting.direction,
        };

        const headerRows = await this.getSqlViewHeaders<SqlFieldHeaders>(sqlViews, options, pagingToDownload);
        const rows = await this.getSqlViewRows<Variables, SqlField>(
            sqlViews,
            useOldPeriods ? dataSetSettings.oldDataSourceId : dataSetSettings.dataSourceId,
            sqlVariables,
            pagingToDownload
        );

        const { pager, objects } = mergeHeadersAndData(options, headerRows, rows);

        const objectsWithApprovalFilter =
            isApproved === undefined
                ? objects
                : isApproved
                ? objects.filter(item => Boolean(item.lastDateOfApproval))
                : objects.filter(item => !item.lastDateOfApproval);

        const modificationCountObjects =
            modificationCount === undefined
                ? objectsWithApprovalFilter
                : modificationCount === "0"
                ? objectsWithApprovalFilter.filter(item => !item.modificationCount)
                : objectsWithApprovalFilter.filter(item => Boolean(item.modificationCount));

        const objectsInPage = await promiseMap(modificationCountObjects, async item => {
            const { approved } = await this.getDataApprovalStatus(item);

            return { ...item, approved: approved };
        });

        return { pager: pager, objects: objectsInPage };
        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).
    }

    private async getDataApprovalStatus(item: MalDataApprovalItem): Promise<{ approved: boolean }> {
        const { mayUnapprove } = await this.api
            .get<{ mayUnapprove: boolean }>("/dataApprovals", {
                ds: item.dataSetUid,
                pe: item.period,
                ou: item.orgUnitUid,
            })
            .getData();

        return { approved: mayUnapprove };
    }

    private async getSqlViewRows<VariablesType extends {}, FieldType extends string>(
        sqlViews: Dhis2SqlViews,
        sqlViewId: string,
        variables: VariablesType,
        pagingToDownload: { page: number; pageSize: number }
    ): Promise<Record<FieldType, string>[]> {
        const { rows } = await sqlViews
            .query<VariablesType, FieldType>(sqlViewId, variables, pagingToDownload)
            .getData();

        return rows;
    }

    private async getSqlViewHeaders<T extends string>(
        sqlViews: Dhis2SqlViews,
        options: MalDataApprovalOptions,
        pagingToDownload: { page: number; pageSize: number }
    ): Promise<Record<T, string>[]> {
        const { config, dataSetId } = options;

        const { rows: headerRows } = await sqlViews
            .query<VariableHeaders, T>(
                getSqlViewId(config, SQL_VIEW_MAL_METADATA_NAME),
                { dataSets: dataSetId ?? "" },
                pagingToDownload
            )
            .getData();

        return headerRows;
    }

    async save(filename: string, dataSets: MalDataApprovalItem[]): Promise<void> {
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

    async complete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        const completeDataSetRegistrations = dataSets.map(ds => ({
            dataSet: ds.dataSet,
            period: ds.period,
            organisationUnit: ds.orgUnit,
            completed: true,
        }));

        try {
            const response = (
                await this.api
                    .post<any>("/completeDataSetRegistrations", {}, { completeDataSetRegistrations })
                    .getData()
            ).response;

            return response.status === "SUCCESS";
        } catch (error: any) {
            return false;
        }
    }

    async approve(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const originalDataSetId = dataSets[0]?.dataSet;
            if (!originalDataSetId) throw Error("No data set ID found");

            const { dataSetId } = await this.getApprovalDataSetId([{ dataSet: originalDataSetId }]);
            const settings = await this.getSettingByDataSet([dataSetId]);
            const dataSetSettings = settings.find(setting => setting.dataSetId === dataSetId);
            if (!dataSetSettings) throw new Error(`Data set settings not found: ${dataSetId}`);

            const dataElement = await getMetadataByIdentifiableToken({
                api: this.api,
                metadataType: "dataElements",
                token: dataSetSettings.dataElements.submissionDate,
            });

            const currentDate = getISODate();

            const dataValues = dataSets.map(ds => {
                return {
                    dataSet: ds.dataSet,
                    period: ds.period,
                    orgUnit: ds.orgUnit,
                    dataElement: dataElement.id,
                    categoryOptionCombo: DEFAULT_COC,
                    value: currentDate,
                };
            });

            const dateResponse = await this.api.post<any>("/dataValueSets.json", {}, { dataValues }).getData();
            if (dateResponse.response.status !== "SUCCESS") throw new Error("Error when posting Submission date");

            let completeCheckResponses: CompleteCheckResponseType = await promiseMap(dataSets, async approval =>
                this.api
                    .get<any>("/completeDataSetRegistrations", {
                        dataSet: approval.dataSet,
                        period: approval.period,
                        orgUnit: approval.orgUnit,
                    })
                    .getData()
            );

            completeCheckResponses = completeCheckResponses.filter(item => Object.keys(item).length !== 0);

            const dataSetsCompleted = completeCheckResponses.flatMap(completeCheckResponse => {
                return completeCheckResponse.completeDataSetRegistrations.map(completeDataSetRegistrations => {
                    return {
                        dataSet: completeDataSetRegistrations.dataSet,
                        period: completeDataSetRegistrations.period,
                        orgUnit: completeDataSetRegistrations.organisationUnit,
                    };
                });
            });

            const dataSetsToComplete = _.differenceWith(dataSets, dataSetsCompleted, (value, othervalue) =>
                _.isEqual(_.omit(value, ["workflow"]), othervalue)
            );

            const completeResponse = dataSetsToComplete.length !== 0 ? await this.complete(dataSetsToComplete) : true;

            const response = await promiseMap(dataSets, async approval =>
                this.api
                    .post<any>(
                        "/dataApprovals",
                        { ds: approval.dataSet, pe: approval.period, ou: approval.orgUnit },
                        {}
                    )
                    .getData()
            );

            return _.every(response, item => item === "") && completeResponse;
        } catch (error: any) {
            return false;
        }
    }

    async getApprovalDataSetId(dataApprovalItems: { dataSet: Id }[]) {
        const dataSetId = dataApprovalItems[0]?.dataSet;
        if (!dataSetId) throw new Error("Data set not found");

        const { name: dataSetName } = await getMetadataByIdentifiableToken({
            api: this.api,
            metadataType: "dataSets",
            token: dataSetId,
        });

        const settings = await this.getSettingByDataSet([dataSetId]);
        const dataSetSettings = settings.find(setting => setting.dataSetId === dataSetId);

        const approvedDataSetCode = dataSetSettings?.approvalDataSetCode;
        if (!approvedDataSetCode) throw new Error(`Approved data set code not found for data set: ${dataSetName}`);

        const { id: apvdDataSetId } = await getMetadataByIdentifiableToken({
            api: this.api,
            metadataType: "dataSets",
            token: approvedDataSetCode,
        });

        return { approvalDataSetId: apvdDataSetId, dataSetId };
    }

    async duplicateDataSets(
        dataSets: MalDataApprovalItemIdentifier[],
        dataElementsWithValues: DataDiffItemIdentifier[]
    ): Promise<boolean> {
        try {
            const { approvalDataSetId, dataSetId } = await this.getApprovalDataSetId(dataSets);

            const dataValueSets: DataSetsValueType[] = await this.getDataValueSets(dataSets);

            const uniqueDataSets = _.uniqBy(dataSets, "dataSet");
            const DSDataElements = await this.getDSDataElements(uniqueDataSets);

            const ADSDataElements: DataElementsType[] = await this.getADSDataElements(approvalDataSetId);

            const dataElementsMatchedArray = DSDataElements.flatMap(DSDataElement => {
                return DSDataElement.dataSetElements.map(element => {
                    const dataElement = element.dataElement;
                    const othername = dataElement.name + DATA_ELEMENT_SUFFIX;
                    const ADSDataElement = ADSDataElements.find(DataElement => String(DataElement.name) === othername);
                    return {
                        origId: dataElement.id,
                        destId: ADSDataElement?.id ?? "",
                    };
                });
            });

            const dataValues = this.makeDataValuesArray(approvalDataSetId, dataValueSets, dataElementsMatchedArray);

            await this.addTimestampsToDataValuesArray(approvalDataSetId, dataSets, dataValues, dataSetId);

            await this.deleteEmptyDataValues(approvalDataSetId, ADSDataElements, dataElementsWithValues);
            return this.chunkedDataValuePost(dataValues, 3000);
        } catch (error: any) {
            console.debug(error);
            return false;
        }
    }

    async duplicateDataValues(dataValues: DataDiffItemIdentifier[]): Promise<boolean> {
        try {
            const { approvalDataSetId, dataSetId } = await this.getApprovalDataSetId(dataValues);
            const uniqueDataSets = _.uniqBy(dataValues, "dataSet");
            const uniqueDataElementsNames = _.uniq(_.map(dataValues, x => x.dataElement));

            const DSDataElements = await this.getDSDataElements(uniqueDataSets);

            const dataValueSets = await this.getDataValueSets(uniqueDataSets);

            const ADSDataElements = await this.getADSDataElements(approvalDataSetId);

            const dataElementsMatchedArray = DSDataElements.flatMap(DSDataElement => {
                return DSDataElement.dataSetElements.flatMap(element => {
                    const dataElement = element.dataElement;
                    if (uniqueDataElementsNames.includes(dataElement.name)) {
                        const othername = dataElement.name + DATA_ELEMENT_SUFFIX;
                        const ADSDataElement = ADSDataElements.find(DataElement => DataElement.name === othername);
                        return {
                            origId: dataElement.id,
                            destId: ADSDataElement?.id ?? "",
                            name: dataElement.name,
                        };
                    } else {
                        return [];
                    }
                });
            });

            const apvdDataValues = this.makeDataValuesArray(approvalDataSetId, dataValueSets, dataElementsMatchedArray);

            await this.addTimestampsToDataValuesArray(approvalDataSetId, dataValues, apvdDataValues, dataSetId);

            await this.deleteEmptyDataValues(approvalDataSetId, ADSDataElements, dataValues);

            return this.chunkedDataValuePost(apvdDataValues, 3000);
        } catch (error: any) {
            console.debug(error);
            return false;
        }
    }

    // TODO: All this logic must be in the domain. ApproveMalDataValuesUseCase.ts
    async replicateDataValuesInApvdDataSet(originalDataValues: DataDiffItemIdentifier[]): Promise<DataValueStats[]> {
        const { approvalDataSetId, dataSetId } = await this.getApprovalDataSetId(originalDataValues);
        const settings = await this.getSettingByDataSet([dataSetId]);
        const dataSetSettings = settings.find(setting => setting.dataSetId === dataSetId);
        if (!dataSetSettings) throw new Error(`Data set settings not found: ${dataSetId}`);

        const approvalDataElements = await this.getADSDataElements(approvalDataSetId);
        const approvalDeByName = _.keyBy(approvalDataElements, dataElement => dataElement.name.toLowerCase());

        const approvalDateDataElement = await getMetadataByIdentifiableToken({
            api: this.api,
            metadataType: "dataElements",
            token: dataSetSettings.dataElements.approvalDate,
        });

        const approvalDataValues = _(originalDataValues)
            .map((dataValue): Maybe<D2DataValue> => {
                const dataElementNameLowerCase = dataValue.dataElementBasicName?.toLowerCase();
                const dataElementKey = `${dataElementNameLowerCase}${DATA_ELEMENT_SUFFIX}`.toLowerCase();
                const apvdDataElement = approvalDeByName[dataElementKey];

                if (!apvdDataElement) {
                    console.warn(
                        `Data element ${dataValue.dataElement} not found in approval data elements. Ignoring record.`
                    );
                    return undefined;
                }

                // Empty dataValues can't be saved, so we skip them.
                // The method deleteEmptyDataValues will handle the deletion of these records
                if (!dataValue.value) return undefined;

                return {
                    dataElement: apvdDataElement.id,
                    value: dataValue.value,
                    orgUnit: dataValue.orgUnit,
                    period: dataValue.period,
                    attributeOptionCombo: dataValue.attributeOptionCombo,
                    categoryOptionCombo: dataValue.categoryOptionCombo,
                    comment: dataValue.comment,
                };
            })
            .compact()
            .value();

        const timeStampDataValues = this.generateTimeStampDataValue(
            approvalDataValues,
            approvalDataSetId,
            approvalDateDataElement.id
        );

        const deleteStats = await this.deleteEmptyDataValues(
            approvalDataSetId,
            approvalDataElements,
            originalDataValues
        );

        const saveStats = await this.saveDataValues(
            approvalDataValues.concat(timeStampDataValues),
            approvalDataSetId,
            "CREATE_AND_UPDATE"
        );
        return [...deleteStats, ...saveStats];
    }

    private async saveDataValues(
        dataValues: D2DataValue[],
        dataSetId: Maybe<Id>,
        strategy: "DELETE" | "CREATE_AND_UPDATE"
    ): Promise<DataValueStats[]> {
        const dvByPeriodAndOrgUnit = _(dataValues)
            .groupBy(item => `${item.orgUnit}-${item.period}`)
            .value();

        const dataValuesByPeriodOrgUnit = _(dvByPeriodAndOrgUnit)
            .map((dvOrgUnitPeriod, key) => {
                const [orgUnit, period] = key.split("-");
                if (!orgUnit || !period) {
                    throw new Error(`[saveDataValues]: Invalid orgUnit or period in key: ${key}`);
                }
                return { period: period, orgUnit: orgUnit, dataValues: dvOrgUnitPeriod };
            })
            .value();

        const dvStats = await promiseMapConcurrent(dataValuesByPeriodOrgUnit, async dataValueToSave => {
            console.debug(
                `${strategy}: ${dataValueToSave.dataValues.length} dataValues: [orgunit-period] ${dataValueToSave.orgUnit}-${dataValueToSave.period}`
            );

            try {
                const response = await this.api.dataValues
                    .postSet(
                        { dryRun: false, importStrategy: strategy },
                        { dataSet: dataSetId, dataValues: dataValueToSave.dataValues }
                    )
                    .getData();

                return this.getDataValueStats({
                    dataSetId: dataSetId,
                    response: response,
                    period: dataValueToSave.period,
                    orgUnitId: dataValueToSave.orgUnit,
                    strategy: strategy === "DELETE" ? "DELETE" : "SAVE",
                });
            } catch (error) {
                const errorResponse = error as D2DataValueResponse;
                return this.getDataValueStats({
                    dataSetId: dataSetId,
                    response: errorResponse.response?.data?.response,
                    period: dataValueToSave.period,
                    orgUnitId: dataValueToSave.orgUnit,
                    strategy: strategy === "DELETE" ? "DELETE" : "SAVE",
                });
            }
        });

        return _(dvStats).compact().value();
    }

    private getDataValueStats(options: {
        dataSetId: Maybe<Id>;
        response: Maybe<DataValueSetsPostResponse>;
        period: string;
        orgUnitId: Id;
        strategy: DataValueStats["strategy"];
    }): Maybe<DataValueStats> {
        const { dataSetId, response, period, orgUnitId, strategy } = options;
        if (!response) {
            console.warn(`Response is undefined or null: ${orgUnitId}-${period}`);
            return undefined;
        }

        return new DataValueStats({
            dataSetId: dataSetId ?? "",
            deleted: response.importCount.deleted,
            updated: response.importCount.updated,
            errorMessages: _(response.conflicts)
                .map(conflict => {
                    return { message: conflict.value };
                })
                .compact()
                .value(),
            ignored: response.importCount.ignored,
            imported: response.importCount.imported,
            period: period,
            orgUnitId: orgUnitId,
            strategy: strategy,
        });
    }

    private generateTimeStampDataValue(
        dataValues: D2DataValue[],
        approvalDataSetId: Id,
        dataElementId: Id
    ): D2DataValue[] {
        const dataValuesByOrgUnitAndPeriod = _(dataValues)
            .groupBy(item => `${item.orgUnit}-${item.period}`)
            .value();

        return Object.keys(dataValuesByOrgUnitAndPeriod).flatMap(key => {
            const [orgUnit, period] = key.split("-");
            if (!orgUnit || !period) {
                console.warn(`[generateTimeStampDataValue]: Invalid orgUnit or period in key: ${key}`);
                return [];
            }

            return {
                dataSet: approvalDataSetId,
                period: period,
                orgUnit: orgUnit,
                dataElement: dataElementId,
                categoryOptionCombo: DEFAULT_COC,
                attributeOptionCombo: DEFAULT_COC,
                value: getISODate(),
            };
        });
    }

    private async getApprovalDataSetIdentifier(): Promise<Id> {
        const { id } = await getMetadataByIdentifiableToken({
            api: this.api,
            metadataType: "dataSets",
            token: MAL_WMR_FORM_APVD_NAME,
        });

        return process.env.REACT_APP_APPROVE_DATASET_ID ?? id;
    }

    private async deleteEmptyDataValues(
        approvalDataSetId: string,
        approvedDataElements: DataElementsType[],
        dataValues: DataDiffItemIdentifier[]
    ): Promise<DataValueStats[]> {
        const emptyDataValues = _(dataValues)
            .filter(dataValue => !dataValue.value && dataValue.apvdValue !== undefined)
            .map((dataValue): Maybe<D2DataValue> => {
                const apvdDataElementId = approvedDataElements.find(
                    dataElement => `${dataValue.dataElementBasicName}${DATA_ELEMENT_SUFFIX}` === dataElement.name
                )?.id;

                if (!apvdDataElementId) {
                    console.warn(`deleteEmptyDataValues: Data element ${dataValue.dataElement} not found`);
                    return undefined;
                }

                return {
                    dataElement: apvdDataElementId,
                    value: dataValue.apvdValue,
                    orgUnit: dataValue.orgUnit,
                    period: dataValue.period,
                    attributeOptionCombo: dataValue.attributeOptionCombo,
                    categoryOptionCombo: dataValue.categoryOptionCombo,
                    comment: dataValue.comment,
                };
            })
            .compact()
            .value();

        if (emptyDataValues.length > 0) {
            return this.saveDataValues(emptyDataValues, approvalDataSetId, "DELETE");
        } else {
            return [];
        }
    }

    private async getDataValueSets(actionItems: any[]): Promise<DataSetsValueType[]> {
        return await promiseMap(actionItems, async item =>
            this.api
                .get<any>("/dataValueSets", {
                    dataSet: item.dataSet,
                    period: item.period,
                    orgUnit: item.orgUnit,
                })
                .getData()
        );
    }

    private async getDSDataElements(actionItems: any[]): Promise<{ dataSetElements: DataSetElementsType[] }[]> {
        return await promiseMap(actionItems, async item =>
            this.api
                .get<any>(`/dataSets/${item.dataSet}`, { fields: "dataSetElements[dataElement[id,name]]" })
                .getData()
        );
    }

    private async getADSDataElements(approvalDataSetId: string): Promise<DataElementsType[]> {
        return await this.api
            .get<any>(`/dataSets/${approvalDataSetId}`, { fields: "dataSetElements[dataElement[id,name]]" })
            .getData()
            .then(ADSDataElements =>
                ADSDataElements.dataSetElements.map((element: DataSetElementsType) => {
                    return {
                        id: element.dataElement.id,
                        name: element.dataElement.name,
                    };
                })
            );
    }

    private async addTimestampsToDataValuesArray(
        approvalDataSetId: string,
        actionItems: MalDataApprovalItemIdentifier[] | DataDiffItemIdentifier[],
        dataValues: DataValueType[],
        originalDataSetId: string
    ) {
        const settings = await this.getSettingByDataSet([originalDataSetId]);
        const dataSetSettings = settings.find(setting => setting.dataSetId === originalDataSetId);
        if (!dataSetSettings) throw new Error(`Data set settings not found: ${originalDataSetId}`);
        const malApprovalDateDataElement = await getMetadataByIdentifiableToken({
            api: this.api,
            metadataType: "dataElements",
            token: dataSetSettings.dataElements.approvalDate,
        });

        actionItems.forEach(actionItem => {
            dataValues.push({
                dataSet: approvalDataSetId,
                period: actionItem.period,
                orgUnit: actionItem.orgUnit,
                dataElement: malApprovalDateDataElement.id,
                categoryOptionCombo: DEFAULT_COC,
                attributeOptionCombo: DEFAULT_COC,
                value: getISODate(),
            });
        });
    }

    private makeDataValuesArray(
        approvalDataSetId: string,
        dataValueSets: DataSetsValueType[],
        dataElementsMatchedArray: DataElementMapping[]
    ): DataValueType[] {
        return dataValueSets.flatMap(dataValueSet => {
            if (dataValueSet.dataValues) {
                return dataValueSet.dataValues.flatMap(dataValue => {
                    const data = { ...dataValue };
                    const destId = dataElementsMatchedArray.find(
                        dataElementsMatchedObj => dataElementsMatchedObj.origId === dataValue.dataElement
                    )?.destId;

                    if (destId && data.value) {
                        data.dataElement = destId;
                        data.dataSet = approvalDataSetId;
                        delete data.lastUpdated;
                        delete data.comment;

                        return data;
                    } else {
                        return [];
                    }
                });
            } else {
                return [];
            }
        });
    }

    private async chunkedDataValuePost(apvdDataValues: DataValueType[], chunkSize: number): Promise<boolean> {
        if (apvdDataValues.length > chunkSize) {
            const copyResponse: DataValueSetsPostResponse[] = [];
            for (let i = 0; i < apvdDataValues.length; i += chunkSize) {
                const chunk = apvdDataValues.slice(i, i + chunkSize);

                return await this.api.dataValues
                    .postSet({}, { dataValues: _.reject(chunk, _.isEmpty) })
                    .getData()
                    .catch(error => console.debug(error))
                    .then(response => {
                        if (response) {
                            console.debug(response);
                            copyResponse.push(response);
                        }
                        return false;
                    });
            }
            return _.every(copyResponse, item => item.status === "SUCCESS");
        } else {
            return await this.api.dataValues
                .postSet({}, { dataValues: _.reject(apvdDataValues, _.isEmpty) })
                .getData()
                .catch(error => console.debug(error))
                .then(copyResponse => {
                    if (copyResponse) {
                        console.debug(copyResponse);
                        return copyResponse.status === "SUCCESS";
                    }
                    return false;
                });
        }
    }

    async duplicateDataValuesAndRevoke(dataValues: DataDiffItemIdentifier[]): Promise<boolean> {
        try {
            const duplicateResponse = await this.duplicateDataValues(dataValues);

            const revokeData: DataDiffItemIdentifier = {
                dataSet: dataValues[0]?.dataSet ?? "",
                period: dataValues[0]?.period ?? "",
                orgUnit: dataValues[0]?.orgUnit ?? "",
                dataElement: dataValues[0]?.dataElement ?? "",
                value: dataValues[0]?.value ?? "",
                apvdValue: dataValues[0]?.apvdValue ?? "",
                comment: dataValues[0]?.comment,
                attributeOptionCombo: dataValues[0]?.attributeOptionCombo,
                categoryOptionCombo: dataValues[0]?.categoryOptionCombo,
                dataElementBasicName: dataValues[0]?.dataElementBasicName,
            };

            const revokeResponse = await this.api
                .delete<any>("/dataApprovals", {
                    ds: revokeData.dataSet,
                    pe: revokeData.period,
                    ou: revokeData.orgUnit,
                })
                .getData();

            return duplicateResponse && revokeResponse === "";
        } catch (error: any) {
            return false;
        }
    }

    async incomplete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const response = await promiseMap(dataSets, item =>
                this.api
                    .delete<any>("/completeDataSetRegistrations", {
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

    async unapprove(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const response = await promiseMap(dataSets, async approval =>
                this.api
                    .delete<any>("/dataApprovals", { ds: approval.dataSet, pe: approval.period, ou: approval.orgUnit })
                    .getData()
            );

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async duplicateUnapprove(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const response: any[] = [];
            dataSets.forEach(async dataSet => {
                const isApproved = await this.api
                    .get<any>("/dataApprovals", { wf: dataSet.workflow, pe: dataSet.period, ou: dataSet.orgUnit })
                    .getData();

                if (isApproved.state === "APPROVED_HERE") {
                    response.push(
                        await this.api
                            .delete<any>("/dataApprovals", {
                                wf: dataSet.workflow,
                                pe: dataSet.period,
                                ou: dataSet.orgUnit,
                            })
                            .getData()
                    );
                }
            });

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async getSortOrder(): Promise<string[]> {
        const sortOrderArray = await this.storageClient.getObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER);

        return sortOrderArray ?? [];
    }

    async saveMalDiffNames(dataSetId: string): Promise<void> {
        try {
            const dataSetData: {
                dataSetElements: DataSetElementsType[];
                sections: { id: string }[];
            } = await this.api
                .get<any>(`/dataSets/${dataSetId}`, { fields: "sections,dataSetElements[dataElement[id,name]]" })
                .getData();

            if (_.isEmpty(dataSetData.sections) || _.isEmpty(dataSetData.dataSetElements)) {
                return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, []);
            }

            const dataSetElements: DataElementsType[] = dataSetData.dataSetElements.map(item => item.dataElement);

            const { sections: sectionsDEs } = await this.api.metadata
                .get({
                    sections: {
                        filter: { id: { in: dataSetData.sections.map(item => item.id) } },
                        fields: { dataElements: { id: true } },
                    },
                })
                .getData();

            const sectionsDEsIds: { id: string }[] = sectionsDEs.flatMap(item => {
                return item.dataElements.map((dataElementId: { id: string }) => {
                    return dataElementId;
                });
            });

            const sortOrderArray: string[] = sectionsDEsIds
                .map(obj =>
                    Object.assign(
                        obj,
                        dataSetElements.find(obj2 => obj.id === obj2.id)
                    )
                )
                .map(item => item.name);

            return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, sortOrderArray);
        } catch (error: any) {
            console.debug(error);
        }
    }

    private async getSettingByDataSet(dataSetIds: Id[]) {
        const response = await this.api.models.dataSets
            .get({
                fields: { id: true, code: true },
                filter: { id: { in: dataSetIds } },
            })
            .getData();

        return response.objects.map(dataSet => {
            const settings = approvalReportSettings.dataSets[dataSet.code];
            if (!settings) throw new Error(`No settings found for dataSet: ${dataSet.code}`);
            return { ...settings, dataSetId: dataSet.id };
        });
    }
}

const csvFields = ["dataSet", "orgUnit", "period", "completed"] as const;

type CsvField = typeof csvFields[number];

type DataSetRow = Record<CsvField, string>;

function getISODate() {
    const date = new Date().toISOString();
    return date.slice(0, date.lastIndexOf(":"));
}

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}

function mergeHeadersAndData(
    options: MalDataApprovalOptions,
    headers: SqlViewGetData<SqlFieldHeaders>["rows"],
    data: SqlViewGetData<SqlField>["rows"]
) {
    const { sorting, paging, orgUnitIds, periods, approvalStatus, completionStatus } = options; // ?
    const rows: Array<MalDataApprovalItem> = [];

    const mapping = _(data)
        .keyBy(dv => {
            return [dv.orgunituid, dv.period].join(".");
        })
        .value();

    const filterOrgUnitIds = orgUnitIds.length > 0 ? orgUnitIds : undefined;

    for (const period of periods) {
        for (const header of headers) {
            if (filterOrgUnitIds !== undefined && filterOrgUnitIds.indexOf(header.orgunituid) === -1) {
                continue;
            }
            const datavalue = mapping[[header.orgunituid, period].join(".")];

            const row: MalDataApprovalItem = {
                dataSetUid: header.datasetuid,
                dataSet: header.dataset as MalDataSet,
                orgUnitUid: header.orgunituid,
                orgUnit: header.orgunit,
                orgUnitCode: header.orgunitcode,
                period: period,
                attribute: datavalue?.attribute,
                approvalWorkflow: datavalue?.approvalworkflow,
                approvalWorkflowUid: datavalue?.approvalworkflowuid,
                completed: datavalue?.completed === "true",
                validated: datavalue?.validated === "true",
                lastUpdatedValue: datavalue?.lastupdatedvalue,
                lastDateOfSubmission: datavalue?.lastdateofsubmission,
                lastDateOfApproval: datavalue?.lastdateofapproval,
                modificationCount: datavalue?.diff,
                monitoring: Boolean(datavalue?.monitoring),
            };
            rows.push(row);
        }
    }

    const rowsSorted = _(rows)
        .orderBy([row => row[sorting.field]], [sorting.direction])
        .value();

    const rowsFiltered = rowsSorted.filter(row => {
        return (
            //completed
            (approvalStatus === undefined && completionStatus === true && row.completed) ||
            //not completed
            (approvalStatus === undefined && completionStatus === false && !row.completed) ||
            //submitted
            (approvalStatus === true && row.validated && row.completed) ||
            //ready for sumbitted
            (approvalStatus === false && !row.validated && row.completed) ||
            //no filter
            (approvalStatus === undefined && completionStatus === undefined)
        );
    });
    return paginate(rowsFiltered, paging);
}

export const MAL_WMR_FORM_CODE = "0MAL_5";
const MAL_WMR_FORM_APVD_NAME = "MAL - WMR Form-APVD";
const DEFAULT_COC = "Xr12mI7VPn3";

type D2DataValue = DataValueSetsPostRequest["dataValues"][number];

type D2DataValueResponse = {
    response?: { data?: { response?: DataValueSetsPostResponse } };
};
