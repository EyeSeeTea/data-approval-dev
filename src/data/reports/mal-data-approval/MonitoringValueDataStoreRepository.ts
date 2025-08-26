import { D2Api } from "@eyeseetea/d2-api/2.34";
import { MonitoringValueRepository } from "../../../domain/reports/mal-data-approval/repositories/MonitoringValueRepository";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { MonitoringValue } from "../../../domain/reports/mal-data-approval/entities/MonitoringValue";
import { Maybe } from "../../../types/utils";

export class MonitoringValueDataStoreRepository implements MonitoringValueRepository {
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(namespace: string): Promise<Maybe<MonitoringValue>> {
        const monitoring = await this.globalStorageClient.getObject<MonitoringValue>(namespace);

        return monitoring;
    }

    async save(namespace: string, monitoring: MonitoringValue): Promise<void> {
        return await this.globalStorageClient.saveObject<MonitoringValue>(namespace, monitoring);
    }
}
