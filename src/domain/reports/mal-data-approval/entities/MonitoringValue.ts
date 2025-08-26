import _ from "lodash";
import { MalDataApprovalItem } from "./MalDataApprovalItem";
import { MalDataSet } from "../../../../data/reports/mal-data-approval/constants/MalDataApprovalConstants";

export type Monitoring = {
    orgUnit: string;
    period: string;
    enable: boolean;
};

export type MonitoringValue = Record<
    "dataSets",
    Record<MalDataSet, { monitoring: Monitoring[]; userGroups: string[] }[]>
>;

export function getDataDuplicationItemMonitoringValue(
    dataApprovalItem: MalDataApprovalItem,
    monitoring: MonitoringValue
): boolean {
    const monitoringArray = _.first(monitoring["dataSets"]?.[dataApprovalItem.dataSet])?.monitoring;

    return !!_.find(monitoringArray, { orgUnit: dataApprovalItem.orgUnitCode, period: dataApprovalItem.period })
        ?.enable;
}
