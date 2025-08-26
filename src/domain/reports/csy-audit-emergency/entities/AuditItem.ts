export interface AuditItem {
    registerId: string;
}

export type AuditType = "overallMortality" | "lowAcuity" | "highestTriage" | "initialRbg" | "shockIvf";
