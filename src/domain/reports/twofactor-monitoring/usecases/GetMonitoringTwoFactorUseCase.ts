import { MonitoringTwoFactorOptions } from "../entities/MonitoringTwoFactorOptions";
import { MonitoringTwoFactorPaginatedObjects } from "../entities/MonitoringTwoFactorPaginatedObjects";
import { MonitoringTwoFactorUser } from "../entities/MonitoringTwoFactorUser";
import { MonitoringTwoFactorRepository } from "../repositories/MonitoringTwoFactorRepository";

export class GetMonitoringTwoFactorUseCase {
    constructor(private monitoringTwoFactorRepository: MonitoringTwoFactorRepository) {}

    execute(
        namespace: string,
        options: MonitoringTwoFactorOptions
    ): Promise<MonitoringTwoFactorPaginatedObjects<MonitoringTwoFactorUser>> {
        return this.monitoringTwoFactorRepository.get(namespace, options);
    }
}
