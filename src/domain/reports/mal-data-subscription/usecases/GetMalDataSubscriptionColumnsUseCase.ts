import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetMalDataSubscriptionColumnsUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.subscriptionRepository.getColumns(namespace);
    }
}
