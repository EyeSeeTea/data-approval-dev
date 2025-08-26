import { Config } from "../../../domain/common/entities/Config";
import {
    DataApprovalItem,
    getDataApprovalItemId,
} from "../../../domain/reports/nhwa-approval-status/entities/DataApprovalItem";

export interface DataApprovalViewModel {
    id: string;
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
    lastUpdatedValue: Date;
}

export function getDataApprovalViews(_config: Config, items: DataApprovalItem[]): DataApprovalViewModel[] {
    return items.map(item => {
        return {
            id: getDataApprovalItemId(item),
            dataSetUid: item.dataSetUid,
            dataSet: item.dataSet,
            orgUnitUid: item.orgUnitUid,
            orgUnit: item.orgUnit,
            period: item.period,
            attribute: item.attribute,
            approvalWorkflowUid: item.approvalWorkflowUid,
            approvalWorkflow: item.approvalWorkflow,
            completed: item.completed,
            validated: item.validated,
            lastUpdatedValue: new Date(item.lastUpdatedValue),
        };
    });
}
