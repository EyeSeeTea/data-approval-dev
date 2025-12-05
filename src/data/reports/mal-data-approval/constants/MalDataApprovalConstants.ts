export const malDataSetCodes: Record<MalDataSet, string> = {
    "MAL - WMR Form": "0MAL_5",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
    "NHWA Module 1": "NHWA-M1-2023",
    "NHWA Module 2": "NHWA-M2-2023",
};

export const malariaDataSets = [
    "MAL - WMR Form",
    "MAL - Antimalarial drug policy",
    "MAL - WMR National Policies",
    "MAL - Malaria Free",
    "NHWA Module 1",
    "NHWA Module 2",
] as const;

export type MalDataSet = typeof malariaDataSets[number];
