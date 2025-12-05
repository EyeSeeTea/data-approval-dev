import { UseCase } from "../../../../compositionRoot";
import { MonitoringDetail } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetMonitoringDetailsUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(): Promise<MonitoringDetail[]> {
        return this.subscriptionRepository.getMonitoringDetails();
    }
}
