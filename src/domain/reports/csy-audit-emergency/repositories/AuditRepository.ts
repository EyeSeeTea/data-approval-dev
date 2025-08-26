import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { AuditItem, AuditType } from "../entities/AuditItem";

export interface AuditItemRepository {
    get(options: AuditOptions): Promise<PaginatedObjects<AuditItem>>;
    save(filename: string, items: AuditItem[]): Promise<void>;
}

export interface AuditOptions {
    paging: Paging;
    sorting: Sorting<AuditItem>;
    year: string;
    quarter?: string;
    orgUnitPaths: string[];
    auditType: AuditType;
}
