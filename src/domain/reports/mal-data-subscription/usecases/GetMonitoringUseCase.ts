import { UseCase } from "../../../../compositionRoot";
import { MonitoringValue } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetMonitoringUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string): Promise<MonitoringValue> {
        return this.subscriptionRepository.getMonitoring(namespace);
    }
}
