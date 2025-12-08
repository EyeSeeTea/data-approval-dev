import { DataSetConfiguration } from "../domain/entities/DataSetConfiguration";
import { Future, FutureData } from "../domain/generic/Future";
import { DataSetConfigurationRepository } from "../domain/repositories/DataSetConfigurationRepository";
import { D2Api } from "../types/d2-api";
import { apiToFuture } from "./api-futures";

export class DataSetConfigurationD2Repository implements DataSetConfigurationRepository {
    private namespace = "dataset-approval";
    private dataStoreUrl = `/dataStore/${this.namespace}`;
    constructor(private api: D2Api) {}

    getByCode(code: string): FutureData<DataSetConfiguration> {
        const dataStore = this.api.dataStore(this.namespace);
        return apiToFuture(dataStore.get<DataSetConfiguration>(`DS_${code}`)).flatMap(data => {
            return data
                ? Future.success(DataSetConfiguration.create(data))
                : Future.error(new Error(`DataSetConfiguration with code ${code} not found`));
        });
    }

    getAll(): FutureData<DataSetConfiguration[]> {
        return apiToFuture(
            this.api.request<D2DataStoreFields>({
                method: "get",
                url: this.dataStoreUrl,
                params: dataStoreFields,
            })
        ).map(response => {
            const onlyDataSetConfigs = response.entries.filter(entry =>
                entry.key.startsWith(DataSetConfiguration.CODE_PREFIX)
            );
            return onlyDataSetConfigs.map(entry => {
                return DataSetConfiguration.create(entry.value);
            });
        });
    }

    save(configuration: DataSetConfiguration): FutureData<void> {
        const dataStore = this.api.dataStore(this.namespace);
        return apiToFuture(dataStore.get<DataSetConfiguration>(`DS_${configuration.id}`)).flatMap(existingData => {
            return apiToFuture(
                dataStore.save(`DS_${configuration.id}`, { ...existingData, ...configuration })
            ).toVoid();
        });
    }
}

type D2DataStoreFields = {
    pager: { page: number; pageSize: number };
    entries: D2Entries[];
};

type D2Entries = { key: string; value: DataSetConfiguration };

const dataStoreFields = { fields: "." };
