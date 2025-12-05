import { AppSettings } from "../common/entities/AppSettings";
import { AppSettingsRepository } from "../common/repositories/AppSettingsRepository";

export class GetAppSettingsUseCase {
    constructor(private appSettingsRepository: AppSettingsRepository) {}

    execute(): Promise<AppSettings> {
        return this.appSettingsRepository.get();
    }
}
