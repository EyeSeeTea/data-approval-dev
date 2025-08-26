import { AppSettings } from "../entities/AppSettings";

export interface AppSettingsRepository {
    get(): Promise<AppSettings>;
}
