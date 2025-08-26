import _ from "lodash";
import { promiseMap } from "../../../../utils/promises";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { AppSettingsRepository } from "../../../common/repositories/AppSettingsRepository";

export class UpdateMalApprovalStatusUseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private appSettingsRepository: AppSettingsRepository
    ) {}

    async execute(items: MalDataApprovalItemIdentifier[], action: UpdateAction): Promise<boolean> {
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
                    return this.approvalRepository.approve(itemsToUpdate);
                case "duplicate": {
                    // "Approve" in UI
                    const dataElementsWithValues = await this.getDataElementsToDuplicate(itemsToUpdate);
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
        items: MalDataApprovalItemIdentifier[]
    ): Promise<DataDiffItemIdentifier[]> {
        const settings = await this.appSettingsRepository.get();
        const dataElementsWithValues = await promiseMap(items, async item => {
            return await new WmrDiffReport(this.dataValueRepository, this.dataSetRepository, settings).getDiff(
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
