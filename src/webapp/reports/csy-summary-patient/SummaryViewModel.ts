import { SummaryItem } from "../../../domain/reports/csy-summary-patient/entities/SummaryItem";

export interface SummaryViewModel {
    id: string;
    group: string;
    subGroup: string;
    yearLessThan1: string;
    year1To4: string;
    year5To9: string;
    year10To14: string;
    year15To19: string;
    year20To40: string;
    year40To60: string;
    year60To80: string;
    yearGreaterThan80: string;
    unknown: string;
    total: string;
}

export function getSummaryViews(items: SummaryItem[]): SummaryViewModel[] {
    return items.map((item, i) => {
        return {
            id: i.toString(),
            group: item.group,
            subGroup: item.subGroup,
            yearLessThan1: item.yearLessThan1,
            year1To4: item.year1To4,
            year5To9: item.year5To9,
            year10To14: item.year10To14,
            year15To19: item.year15To19,
            year20To40: item.year20To40,
            year40To60: item.year40To60,
            year60To80: item.year60To80,
            yearGreaterThan80: item.yearGreaterThan80,
            unknown: item.unknown,
            total: item.total,
        };
    });
}
