import { AuditItem } from "../../../domain/reports/csy-audit-emergency/entities/AuditItem";

export interface AuditViewModel {
    id: string;
    registerId: string;
}

export function getAuditViews(items: AuditItem[]): AuditViewModel[] {
    return items.map((item, i) => {
        return {
            id: i.toString(),
            registerId: item.registerId,
        };
    });
}
