import { FixTotalSettings } from "../entities/FixTotalsSettings";

export interface FixTotalsSettingsRepository {
    get(): Promise<FixTotalSettings>;
}
