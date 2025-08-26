export interface SummaryItem {
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

export type SummaryType = "patientCharacteristics";
