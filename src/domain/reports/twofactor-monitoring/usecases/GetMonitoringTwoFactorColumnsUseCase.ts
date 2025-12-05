import { MonitoringTwoFactorRepository } from "../repositories/MonitoringTwoFactorRepository";

export class GetMonitoringTwoFactorColumnsUseCase {
    constructor(private userInfoRepository: MonitoringTwoFactorRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.userInfoRepository.getColumns(namespace);
    }
}
