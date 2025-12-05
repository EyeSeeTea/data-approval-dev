import { UseCase } from "../../../../compositionRoot";
import { MonitoringValue } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class SaveMonitoringUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string, monitoring: MonitoringValue): Promise<void> {
        return this.subscriptionRepository.saveMonitoring(namespace, monitoring);
    }
}
