import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { SummaryItem, SummaryType } from "../entities/SummaryItem";

export interface SummaryItemRepository {
    get(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>>;
    save(filename: string, items: SummaryItem[]): Promise<void>;
}

export interface SummaryOptions {
    paging: Paging;
    sorting: Sorting<SummaryItem>;
    year: string;
    quarter?: string;
    orgUnitPaths: string[];
    summaryType: SummaryType;
}
