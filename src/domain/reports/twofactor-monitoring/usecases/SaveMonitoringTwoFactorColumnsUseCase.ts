import { MonitoringTwoFactorRepository } from "../repositories/MonitoringTwoFactorRepository";

export class SaveMonitoringTwoFactorColumnsUseCase {
    constructor(private userInfoRepository: MonitoringTwoFactorRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.userInfoRepository.saveColumns(namespace, columns);
    }
}
