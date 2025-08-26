import { UseCase } from "../../../../compositionRoot";
import { SubscriptionStatus } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetSubscriptionUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string): Promise<SubscriptionStatus[]> {
        return this.subscriptionRepository.getSubscription(namespace);
    }
}
