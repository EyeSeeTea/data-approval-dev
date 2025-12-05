import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { DataSetStatusRepository } from "../../../common/repositories/DataSetStatusRepository";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataSetUtils } from "./utils/dataSets";

export class DuplicateDataValuesUseCase implements UseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataSetStatusRepository: DataSetStatusRepository
    ) {}

    async execute(items: DataDiffItemIdentifier[]): Promise<boolean> {
        const groupItems = _(items)
            .map(item => ({ dataSetId: item.dataSet, orgUnitId: item.orgUnit, period: item.period }))
            .uniq()
            .value();

        new DataSetUtils(this.dataSetStatusRepository).validateDataSetsStatus(groupItems);
        const stats = await this.approvalRepository.replicateDataValuesInApvdDataSet(items);
        return stats.filter(stat => stat.errorMessages.length > 0).length === 0;
    }
}
