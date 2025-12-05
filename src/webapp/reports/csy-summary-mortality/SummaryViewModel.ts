import { SummaryItem } from "../../../domain/reports/csy-summary-mortality/entities/SummaryItem";

export interface SummaryViewModel {
    id: string;
    scoringSystem: string;
    severity: string;
    mortality: any;
    total: string;
}

export function getSummaryViews(items: SummaryItem[]): SummaryViewModel[] {
    return items.map(item => {
        return {
            id: `${item.scoringSystem}-${item.severity}`,
            scoringSystem: item.scoringSystem,
            severity: item.severity,
            mortality: item.mortality,
            total: item.total,
        };
    });
}
