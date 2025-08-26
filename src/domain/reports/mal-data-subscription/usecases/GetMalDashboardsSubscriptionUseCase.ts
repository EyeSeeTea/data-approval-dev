import { UseCase } from "../../../../compositionRoot";
import { DashboardSubscriptionItem, MalSubscriptionPaginatedObjects } from "../entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionRepository,
    MalDataSubscriptionOptions,
} from "../repositories/MalDataSubscriptionRepository";

export class GetMalDashboardsSubscriptionUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(options: MalDataSubscriptionOptions): Promise<MalSubscriptionPaginatedObjects<DashboardSubscriptionItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.subscriptionRepository.getChildrenDataElements(options);
    }
}
