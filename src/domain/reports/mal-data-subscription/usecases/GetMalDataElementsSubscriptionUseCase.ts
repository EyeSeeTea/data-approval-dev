import { UseCase } from "../../../../compositionRoot";
import { DataElementsSubscriptionItem, MalSubscriptionPaginatedObjects } from "../entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionRepository,
    MalDataSubscriptionOptions,
} from "../repositories/MalDataSubscriptionRepository";

export class GetMalDataElementsSubscriptionUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(
        options: MalDataSubscriptionOptions
    ): Promise<MalSubscriptionPaginatedObjects<DataElementsSubscriptionItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.subscriptionRepository.get(options);
    }
}
