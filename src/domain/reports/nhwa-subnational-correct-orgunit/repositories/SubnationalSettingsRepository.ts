import { SubnationalCorrectSettings } from "../entities/SubnationalCorrect";

export interface SubnationalCorrectSettingsRepository {
    get(): Promise<SubnationalCorrectSettings>;
}
