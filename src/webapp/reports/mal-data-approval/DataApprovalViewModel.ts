import {
    MalDataApprovalItem,
    getDataDuplicationItemId,
} from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { toDate, zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { DataSetWithConfigPermissions } from "../../../domain/usecases/GetApprovalConfigurationsUseCase";

export type IntermediateApprovalStatus = "approved" | "notApproved" | "na";

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
    intermediateApprovalRequired: boolean;
    intermediateApproved: boolean;
    effectiveIntermediateApproval: IntermediateApprovalStatus;
}

export function getDataApprovalViews(
    items: MalDataApprovalItem[],
    timeZoneId: string,
    dataSetsConfig: DataSetWithConfigPermissions[]
): DataApprovalViewModel[] {
    return items.map(item => {
        const config = dataSetsConfig.find(ds => ds.dataSet.id === item.dataSetUid);
        const intermediateApprovalRequired = Boolean(config?.configuration.intermediateApprovalRequired);
        const intermediateApproved = Boolean(item.intermediateApproved);
        const hasModifications = Boolean(item.modificationCount);
        const effectiveIntermediateApproval: IntermediateApprovalStatus = !intermediateApprovalRequired
            ? "na"
            : intermediateApproved && !hasModifications
            ? "approved"
            : "notApproved";

        return {
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
            lastUpdatedValue: item.lastUpdatedValue
                ? convertToUserTime({ serverDate: item.lastUpdatedValue, timeZoneId })
                : undefined,
            lastDateOfSubmission: item.lastDateOfSubmission
                ? toDate(item.lastDateOfSubmission, { timeZone: "UTC" })
                : undefined,
            lastDateOfApproval: item.lastDateOfApproval
                ? toDate(item.lastDateOfApproval, { timeZone: "UTC" })
                : undefined,
            modificationCount: item.modificationCount,
            monitoring: item.monitoring,
            approved: item.approved,
            intermediateApprovalRequired: intermediateApprovalRequired,
            intermediateApproved: intermediateApproved,
            effectiveIntermediateApproval: effectiveIntermediateApproval,
        };
    });
}

export const convertToUserTime = ({ serverDate, timeZoneId }: { serverDate: string; timeZoneId: string }): Date => {
    const utcDate = zonedTimeToUtc(serverDate, timeZoneId);

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const userDate = utcToZonedTime(utcDate, userTimeZone);

    return userDate;
};
