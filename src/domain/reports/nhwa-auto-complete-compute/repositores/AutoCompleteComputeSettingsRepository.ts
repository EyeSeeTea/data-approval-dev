import { AutoCompleteComputeSettings } from "../entities/AutoCompleteComputeSettings";

export interface AutoCompleteComputeSettingsRepository {
    get(key: string): Promise<AutoCompleteComputeSettings>;
}
