import { SubnationalCorrectSettings } from "../../../domain/reports/nhwa-subnational-correct-orgunit/entities/SubnationalCorrect";
import { SubnationalCorrectSettingsRepository } from "../../../domain/reports/nhwa-subnational-correct-orgunit/repositories/SubnationalSettingsRepository";
import { D2Api } from "../../../types/d2-api";
import { d2ReportsDataStoreNamespace } from "../../common/clients/storage/Namespaces";

export class SubnationalCorrectD2SettingsRepository implements SubnationalCorrectSettingsRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<SubnationalCorrectSettings> {
        const key = "nhwa-subnational-correct-orgunit";
        const dataStore = this.api.dataStore(d2ReportsDataStoreNamespace);
        const config = await dataStore.get<SubnationalCorrectSettings>(key).getData();
        if (!config) {
            throw Error(`Could not load configuration from dataStore: ${d2ReportsDataStoreNamespace}/${key}`);
        }
        return config;
    }
}
