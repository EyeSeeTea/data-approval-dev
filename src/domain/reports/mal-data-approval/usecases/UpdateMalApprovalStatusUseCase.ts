import _ from "lodash";
import { promiseMap } from "../../../../utils/promises";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { AppSettingsRepository } from "../../../common/repositories/AppSettingsRepository";
import { DataSetWithConfigPermissions } from "../../../usecases/GetApprovalConfigurationsUseCase";

export class UpdateMalApprovalStatusUseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private appSettingsRepository: AppSettingsRepository
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

        const result = await promiseMap(dataSetIds, async dataSetId => {
            const itemsToUpdate = itemsByDataSet[dataSetId];
            if (!itemsToUpdate) return true;

            switch (action) {
                case "complete":
                    return this.approvalRepository.complete(itemsToUpdate);
                case "approve":
                    // "Submit" in UI
                    return this.approvalRepository.approve(itemsToUpdate, log);
                case "duplicate": {
                    // "Approve" in UI
                    const dataElementsWithValues = await this.getDataElementsToDuplicate(itemsToUpdate, dataSetsConfig);
                    const stats = await this.approvalRepository.replicateDataValuesInApvdDataSet(
                        dataElementsWithValues
                    );
                    return stats.filter(stats => stats.errorMessages.length > 0).length === 0;
                }
                case "revoke": {
                    const revokeResult = await this.approvalRepository.unapprove(itemsToUpdate);
                    const incompleteResult = await this.approvalRepository.incomplete(itemsToUpdate);
                    return revokeResult && incompleteResult;
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
        dataSetsConfig: DataSetWithConfigPermissions[]
    ): Promise<DataDiffItemIdentifier[]> {
        const dataElementsWithValues = await promiseMap(items, async item => {
            return await new WmrDiffReport(this.dataValueRepository, this.dataSetRepository, dataSetsConfig).getDiff(
                item.dataSet,
                item.orgUnit,
                item.period
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
