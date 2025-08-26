import _ from "lodash";
import { PaginatedObjects } from "../../../../types/d2-api";
import { NamedRef } from "../../../common/entities/Base";

export interface DataElementsSubscriptionItem {
    dataElementName: string;
    dataElementId: string;
    section: NamedRef | undefined;
    dataElementGroups: NamedRef[];
    subscription: boolean;
    lastDateOfSubscription: string;
}

export type SubscriptionValue = "Subscribed" | "Not Subscribed" | "Subscribed to some elements";

export interface DashboardSubscriptionItem {
    id: string;
    name: string;
    subscribedElements: string;
    subscription: SubscriptionValue;
    lastDateOfSubscription: string;
    children: ChildrenDataElement[];
}

export interface ChildrenDataElement extends NamedRef {
    dataElementGroups: NamedRef[];
    subscription: SubscriptionValue;
    lastDateOfSubscription: string;
    code: string;
    dataSetElements: {
        dataSet: {
            id: string;
            name: string;
        };
    }[];
}

export interface DataElementSubscriptionItemIdentifier {
    dataElementId: string;
    sectionId: string | undefined;
}

export interface DashboardSubscriptionItemIdentifier {
    dashboardId: string;
    dataElementIds: string[];
}

export interface SubscriptionStatus {
    dataElementId: string;
    subscribed: boolean;
    dashboardId?: string;
    lastDateOfSubscription?: string;
    user: string;
}

export type ElementType = "dataElements" | "dashboards" | "visualizations";

export interface MalSubscriptionPaginatedObjects<T> extends PaginatedObjects<T> {
    sections?: NamedRef[];
    dataElementGroups?: NamedRef[];
    totalRows: T[];
}

export interface MonitoringDetail {
    dataElementId: string;
    dataElementCode: string;
    dataSet: string;
}

export type MonitoringValue = { dataElements: MonitoringDetail[] };

export function getDataElementSubscriptionItemId(dataElement: DataElementsSubscriptionItem): string {
    return [dataElement.dataElementId, dataElement.section?.id].join("-");
}

export function getDashboardSubscriptionItemId(dashboard: DashboardSubscriptionItem): string {
    return [["dashboard", dashboard.id].join("-"), dashboard.children.map(child => child.id).join("-")].join("-");
}

export function parseDataElementSubscriptionItemId(string: string): DataElementSubscriptionItemIdentifier | undefined {
    const [dataElementId, sectionId] = string.split("-");
    if (!dataElementId) return undefined;

    return { dataElementId, sectionId };
}

export function parseDashboardSubscriptionItemId(string: string): DashboardSubscriptionItemIdentifier | undefined {
    const ids = string.split("-");
    const dashboardId = _.first(ids) === "dashboard" ? ids[1] : "";
    const dataElementIds = _.first(ids) === "dashboard" ? ids.slice(2) : ids;

    if (dashboardId === undefined || !dataElementIds) return undefined;

    return { dashboardId, dataElementIds };
}
