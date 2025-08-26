import { Id } from "../entities/Base";
import { DataSetStatus } from "../entities/DataSetStatus";

export interface DataSetStatusRepository {
    getBy(options: GetOptions): Promise<DataSetStatus>;
}

type GetOptions = {
    dataSetId: Id;
    orgUnitId: Id;
    period: string;
};
