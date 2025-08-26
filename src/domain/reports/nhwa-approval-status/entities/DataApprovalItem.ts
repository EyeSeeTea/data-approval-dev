export interface DataApprovalItem {
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    attribute: string;
    approvalWorkflowUid: string;
    approvalWorkflow: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: string;
}

export interface DataApprovalItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
    workflow: string;
}

export function getDataApprovalItemId(dataSet: DataApprovalItem): string {
    return [dataSet.dataSetUid, dataSet.approvalWorkflowUid, dataSet.period, dataSet.orgUnitUid].join("-");
}

export function parseDataApprovalItemId(string: string): DataApprovalItemIdentifier | undefined {
    const [dataSet, workflow, period, orgUnit] = string.split("-");
    if (!dataSet || !workflow || !period || !orgUnit) return undefined;

    return { dataSet, workflow, period, orgUnit };
}
