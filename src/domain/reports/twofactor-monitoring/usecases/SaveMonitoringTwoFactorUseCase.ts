import { UseCase } from "../../../../compositionRoot";
import { MonitoringTwoFactorUser } from "../entities/MonitoringTwoFactorUser";
import { MonitoringTwoFactorRepository } from "../repositories/MonitoringTwoFactorRepository";

export class SaveMonitoringTwoFactorUseCase implements UseCase {
    constructor(private monitoringRepository: MonitoringTwoFactorRepository) {}

    execute(fileName: string, items: MonitoringTwoFactorUser[]): Promise<void> {
        return this.monitoringRepository.save(fileName, items);
    }
}
