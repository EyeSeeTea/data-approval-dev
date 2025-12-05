import { UseCase } from "../../../../compositionRoot";
import { AuthoritiesMonitoringItem } from "../entities/AuthoritiesMonitoringItem";
import { AuthoritiesMonitoringRepository } from "../repositories/AuthoritiesMonitoringRepository";

export class SaveAuthoritiesMonitoringUseCase implements UseCase {
    constructor(private monitoringRepository: AuthoritiesMonitoringRepository) {}

    execute(fileName: string, items: AuthoritiesMonitoringItem[]): Promise<void> {
        return this.monitoringRepository.save(fileName, items);
    }
}
