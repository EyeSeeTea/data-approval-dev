import { MalDataSet } from "../../../../data/reports/mal-data-approval/constants/MalDataApprovalConstants";
import { Maybe } from "../../../../types/utils";

export interface MalDataApprovalItem {
    dataSetUid: string;
    dataSet: MalDataSet;
    orgUnitUid: string;
    orgUnit: string;
    orgUnitCode: string;
    period: string;
    attribute: string | undefined;
    approvalWorkflowUid: string | undefined;
    approvalWorkflow: string | undefined;
    completed: boolean;
    validated: boolean;
    approved?: boolean;
    lastUpdatedValue: string | undefined;
    lastDateOfSubmission: string | undefined;
    lastDateOfApproval: string | undefined;
    modificationCount: string | undefined;
    monitoring: boolean;
}

export interface MalDataApprovalItemIdentifier {
    dataSet: string;
    orgUnit: string;
    orgUnitCode: string;
    period: string;
    workflow: string | undefined;
}

export function getDataDuplicationItemId(dataSet: MalDataApprovalItem): string {
    return [
        dataSet.dataSetUid,
        dataSet.approvalWorkflowUid,
        dataSet.period,
        dataSet.orgUnitUid,
        dataSet.orgUnitCode,
    ].join("-");
}

export function parseDataDuplicationItemId(string: string): MalDataApprovalItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit, orgUnitCode] = string.split("-");
    if (!dataSet || !period || !orgUnit || !orgUnitCode) return undefined;

    return { dataSet, workflow, period, orgUnit, orgUnitCode };
}

export const modificationCountFilters = ["none", "some"] as const;

export type ModificationCountFilter = typeof modificationCountFilters[number];

export function parseModificationCountFilter(value: Maybe<string>): Maybe<ModificationCountFilter> {
    return modificationCountFilters.find(filter => filter === value);
}

export function hasModifications(modificationCount: Maybe<string>): boolean {
    return Number(modificationCount) > 0;
}

export function matchesModificationCountFilter(
    modificationCount: Maybe<string>,
    filter: ModificationCountFilter
): boolean {
    return filter === "some" ? hasModifications(modificationCount) : !hasModifications(modificationCount);
}
