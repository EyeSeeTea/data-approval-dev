export interface AuditItem {
    registerId: string;
}

export type AuditType =
    | "mortality"
    | "hypoxia"
    | "tachypnea"
    | "mental"
    | "allMortality"
    | "emergencyUnit"
    | "hospitalMortality"
    | "severeInjuries"
    | "moderateInjuries"
    | "moderateSevereInjuries";
