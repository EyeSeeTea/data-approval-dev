import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { SummaryItem } from "../entities/SummaryItem";
import { SummaryOptions, SummaryItemRepository } from "../repositories/SummaryItemRepository";

export class GetSummaryUseCase {
    constructor(private summaryRepository: SummaryItemRepository) {}

    execute(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        return this.summaryRepository.get(options);
    }
}
