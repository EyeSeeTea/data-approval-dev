import _ from "lodash";
import { promiseMap } from "../../../../utils/promises";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { DataSetWithConfigPermissions } from "../../../usecases/GetApprovalConfigurationsUseCase";
import { UserReadableDataElementsService } from "../services/UserReadableDataElementsService";
import { Id } from "../../../common/entities/Base";
import { Maybe } from "../../../../types/utils";

export class UpdateMalApprovalStatusUseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private userReadableDataElementsService: UserReadableDataElementsService
    ) {}

    async execute(options: {
        items: MalDataApprovalItemIdentifier[];
        action: UpdateAction;
        log?: Log;
        dataSetsConfig: DataSetWithConfigPermissions[];
    }): Promise<boolean> {
        const { items, action, log, dataSetsConfig } = options;
        const itemsByDataSet = _(items)
            .groupBy(item => item.dataSet)
            .value();

        const dataSetIds = _(items)
            .map(item => item.dataSet)
            .uniq()
            .value();
        const isCurrentUserSuperAdmin = await this.userReadableDataElementsService.isCurrentUserSuperAdmin();
        const shouldValidateAnyDataSet = dataSetIds.some(dataSetId =>
            shouldValidateDataElementGroupForDataSet(dataSetsConfig, dataSetId, isCurrentUserSuperAdmin)
        );
        const allowedOriginalDataElementIds = shouldValidateAnyDataSet
            ? await this.userReadableDataElementsService.getAllowedOriginalDataElementIds()
            : [];

        const result = await promiseMap(dataSetIds, async dataSetId => {
            const itemsToUpdate = itemsByDataSet[dataSetId];
            const config = dataSetsConfig.find(config => config.dataSet.id === dataSetId);
            if (!itemsToUpdate || !config) return true;
            const allowedDataElementIdsForDataSet = shouldValidateDataElementGroupForDataSet(
                dataSetsConfig,
                dataSetId,
                isCurrentUserSuperAdmin
            )
                ? allowedOriginalDataElementIds
                : undefined;

            switch (action) {
                case "complete":
                    return this.approvalRepository.complete(itemsToUpdate);
                case "approve":
                    // "Submit" in UI
                    return this.approvalRepository.approve({ dataSets: itemsToUpdate, log, dataSetConfig: config });
                case "duplicate": {
                    // "Approve" in UI
                    const dataElementsWithValues = await this.getDataElementsToDuplicate(
                        itemsToUpdate,
                        dataSetsConfig,
                        allowedDataElementIdsForDataSet
                    );
                    const stats = await this.approvalRepository.replicateDataValuesInApvdDataSet({
                        originalDataValues: dataElementsWithValues,
                        dataSetConfig: config,
                    });
                    return stats.filter(stats => stats.errorMessages.length > 0).length === 0;
                }
                case "revoke": {
                    const revokeResult = await this.approvalRepository.unapprove(itemsToUpdate);
                    if (config.configuration.revokeAndIncomplete) {
                        const incompleteResult = await this.approvalRepository.incomplete(itemsToUpdate);
                        return revokeResult && incompleteResult;
                    }
                    return revokeResult;
                }
                case "incomplete":
                    return this.approvalRepository.incomplete(itemsToUpdate);
                default:
                    return false;
            }
        });

        return _(result).every(res => res === true);
    }

    private async getDataElementsToDuplicate(
        items: MalDataApprovalItemIdentifier[],
        dataSetsConfig: DataSetWithConfigPermissions[],
        allowedOriginalDataElementIds: Maybe<Id[]>
    ): Promise<DataDiffItemIdentifier[]> {
        const dataElementsWithValues = await promiseMap(items, async item => {
            return await new WmrDiffReport(this.dataValueRepository, this.dataSetRepository, dataSetsConfig).getDiff(
                item.dataSet,
                item.orgUnit,
                item.period,
                false,
                allowedOriginalDataElementIds
            );
        });

        return _(dataElementsWithValues)
            .flatten()
            .map(dataElementWithValues => {
                const { dataElement, value, apvdValue, comment } = dataElementWithValues;
                if (!dataElement) throw Error("No data element found");

                return {
                    dataSet: dataElementWithValues.dataSetUid,
                    orgUnit: dataElementWithValues.orgUnitUid,
                    period: dataElementWithValues.period,
                    dataElement: dataElement,
                    value: value ?? "",
                    apvdValue: apvdValue ?? "",
                    comment: comment,
                    attributeOptionCombo: dataElementWithValues.attributeOptionCombo,
                    categoryOptionCombo: dataElementWithValues.categoryOptionCombo,
                    dataElementBasicName: dataElementWithValues.dataElementBasicName,
                };
            })
            .compact()
            .value();
    }
}

function shouldValidateDataElementGroupForDataSet(
    dataSetsConfig: DataSetWithConfigPermissions[],
    dataSetId: Id,
    isCurrentUserSuperAdmin: boolean
): boolean {
    if (isCurrentUserSuperAdmin) return false;

    const dataSetConfig = dataSetsConfig.find(config => config.dataSet.id === dataSetId);
    return dataSetConfig?.configuration.validateDataElementGroup || false;
}

type UpdateAction =
    | "complete"
    | "approve"
    | "duplicate"
    | "incomplete"
    | "unapprove"
    | "activate"
    | "deactivate"
    | "revoke";

export type Log = (msg: string) => void;
