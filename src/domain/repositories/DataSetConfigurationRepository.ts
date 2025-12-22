import { DataSetConfiguration } from "../entities/DataSetConfiguration";
import { FutureData } from "../generic/Future";

export interface DataSetConfigurationRepository {
    getByCode(code: string): FutureData<DataSetConfiguration>;
    getAll(): FutureData<DataSetConfiguration[]>;
    save(configuration: DataSetConfiguration): FutureData<void>;
    remove(id: string): FutureData<void>;
}
