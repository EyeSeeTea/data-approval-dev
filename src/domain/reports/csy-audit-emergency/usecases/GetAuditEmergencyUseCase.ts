import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";
import { AuditOptions, AuditItemRepository } from "../repositories/AuditRepository";

export class GetAuditEmergencyUseCase {
    constructor(private auditRepository: AuditItemRepository) {}

    execute(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        return this.auditRepository.get(options);
    }
}
