import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { DataSetStatusRepository } from "../../../common/repositories/DataSetStatusRepository";
import { DataSetWithConfigPermissions } from "../../../usecases/GetApprovalConfigurationsUseCase";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";
import { DataSetUtils } from "./utils/dataSets";

export class DuplicateDataValuesUseCase implements UseCase {
    constructor(
        private approvalRepository: MalDataApprovalRepository,
        private dataSetStatusRepository: DataSetStatusRepository
    ) {}

    async execute(items: DataDiffItemIdentifier[], dataSetsConfig: DataSetWithConfigPermissions[]): Promise<boolean> {
        const groupItems = _(items)
            .map(item => ({ dataSetId: item.dataSet, orgUnitId: item.orgUnit, period: item.period }))
            .uniq()
            .value();

        const dataSetId = items[0]?.dataSet;
        const dataSetConfig = dataSetsConfig.find(config => config.dataSet.id === dataSetId);
        if (!dataSetConfig) throw new Error(`Data set configuration not found: ${dataSetId}`);

        new DataSetUtils(this.dataSetStatusRepository).validateDataSetsStatus(groupItems);
        const stats = await this.approvalRepository.replicateDataValuesInApvdDataSet({
            originalDataValues: items,
            dataSetConfig,
        });
        return stats.filter(stat => stat.errorMessages.length > 0).length === 0;
    }
}
