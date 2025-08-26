import { Id } from "../entities/Base";
import { DataSet } from "../entities/DataSet";

export interface DataSetRepository {
    getById(id: Id): Promise<DataSet[]>;
    getByNameOrCode(nameOrCode: string): Promise<DataSet>;
}
