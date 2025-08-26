import {
    MalDataApprovalItem,
    getDataDuplicationItemId,
} from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { toDate } from "date-fns-tz";

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
    lastUpdatedValue: Date | undefined;
    lastDateOfSubmission: Date | undefined;
    lastDateOfApproval: Date | undefined;
    modificationCount: string | undefined;
    monitoring: boolean;
    approved: boolean | undefined;
}

export function getDataApprovalViews(items: MalDataApprovalItem[]): DataApprovalViewModel[] {
    return items.map(item => ({
        id: getDataDuplicationItemId(item),
        dataSetUid: item.dataSetUid,
        dataSet: item.dataSet,
        orgUnitUid: item.orgUnitUid,
        orgUnit: item.orgUnit,
        period: item.period,
        attribute: item.attribute ?? "-",
        approvalWorkflowUid: item.approvalWorkflowUid ?? "-",
        approvalWorkflow: item.approvalWorkflow ?? "-",
        completed: item.completed,
        validated: item.validated,
        lastUpdatedValue: item.lastUpdatedValue ? toDate(item.lastUpdatedValue, { timeZone: "UTC" }) : undefined,
        lastDateOfSubmission: item.lastDateOfSubmission
            ? toDate(item.lastDateOfSubmission, { timeZone: "UTC" })
            : undefined,
        lastDateOfApproval: item.lastDateOfApproval ? toDate(item.lastDateOfApproval, { timeZone: "UTC" }) : undefined,
        modificationCount: item.modificationCount,
        monitoring: item.monitoring,
        approved: item.approved,
    }));
}
