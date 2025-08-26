import { Id } from "../common/entities/Base";
import { DataSetStatus } from "../common/entities/DataSetStatus";
import { DataSetStatusRepository } from "../common/repositories/DataSetStatusRepository";

export class GetDataSetStatusUseCase {
    constructor(private dataSetStatusRepository: DataSetStatusRepository) {}

    execute(options: { dataSetId: Id; orgUnitId: Id; period: string }): Promise<DataSetStatus> {
        return this.dataSetStatusRepository.getBy(options);
    }
}
