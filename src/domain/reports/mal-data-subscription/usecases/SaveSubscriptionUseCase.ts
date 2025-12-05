import { UseCase } from "../../../../compositionRoot";
import { SubscriptionStatus } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class SaveSubscriptionUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string, subscriptionStatus: SubscriptionStatus[]): Promise<void> {
        return this.subscriptionRepository.saveSubscription(namespace, subscriptionStatus);
    }
}
