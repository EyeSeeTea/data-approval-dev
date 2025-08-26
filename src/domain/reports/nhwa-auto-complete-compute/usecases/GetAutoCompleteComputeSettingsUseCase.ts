import { AutoCompleteComputeSettings } from "../entities/AutoCompleteComputeSettings";
import { AutoCompleteComputeSettingsRepository } from "../repositores/AutoCompleteComputeSettingsRepository";

export class GetAutoCompleteComputeSettingsUseCase {
    constructor(private settingsRepository: AutoCompleteComputeSettingsRepository) {}

    async execute(options: GetAutoCompleteComputeSettingsOptions): Promise<AutoCompleteComputeSettings> {
        return this.settingsRepository.get(options.settingsKey);
    }
}

type GetAutoCompleteComputeSettingsOptions = { settingsKey: string };
