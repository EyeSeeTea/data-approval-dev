import { FixTotalSettings } from "../../../domain/reports/nhwa-fix-totals/entities/FixTotalsSettings";
import { FixTotalsSettingsRepository } from "../../../domain/reports/nhwa-fix-totals/repositories/FixTotalsSettingsRepository";
import { D2Api } from "../../../types/d2-api";
import { d2ReportsDataStoreNamespace } from "../../common/clients/storage/Namespaces";

export class FixTotalsSettingsD2Repository implements FixTotalsSettingsRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<FixTotalSettings> {
        const key = "nhwa-fix-totals-activity-level";
        const dataStore = this.api.dataStore(d2ReportsDataStoreNamespace);
        const config = await dataStore.get<FixTotalSettings>(key).getData();
        if (!config) {
            throw Error(`Could not load configuration from dataStore: ${d2ReportsDataStoreNamespace}/${key}`);
        }
        return config;
    }
}
