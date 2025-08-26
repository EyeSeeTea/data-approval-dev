import { promiseMap } from "../../../../../utils/promises";
import { Id } from "../../../../common/entities/Base";
import { DataSetStatusRepository } from "../../../../common/repositories/DataSetStatusRepository";

export class DataSetUtils {
    constructor(private dataSetStatusRepository: DataSetStatusRepository) {}

    async validateDataSetsStatus(options: Array<{ dataSetId: Id; orgUnitId: Id; period: string }>) {
        await promiseMap(options, async option => {
            if (!option.dataSetId || !option.orgUnitId || !option.period)
                throw new Error("DataSet, OrgUnit or Period not found");

            const status = await this.dataSetStatusRepository.getBy(option);
            if (status.isSubmitted) {
                throw new Error(`DataSet cannot be approved because is already submitted`);
            }
        });
    }
}
