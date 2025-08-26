import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class SaveMalDataSubscriptionColumnsUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.subscriptionRepository.saveColumns(namespace, columns);
    }
}
