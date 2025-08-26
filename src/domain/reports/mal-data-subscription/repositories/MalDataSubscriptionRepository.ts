import { Config } from "../../../common/entities/Config";
import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    DashboardSubscriptionItem,
    ElementType,
    DataElementsSubscriptionItem,
    SubscriptionStatus,
    MalSubscriptionPaginatedObjects,
    MonitoringValue,
    MonitoringDetail,
} from "../entities/MalDataSubscriptionItem";

export interface MalDataSubscriptionRepository {
    get(options: MalDataSubscriptionOptions): Promise<MalSubscriptionPaginatedObjects<DataElementsSubscriptionItem>>;
    getChildrenDataElements(
        options: MalDataSubscriptionOptions
    ): Promise<MalSubscriptionPaginatedObjects<DashboardSubscriptionItem>>;
    getMonitoringDetails(): Promise<MonitoringDetail[]>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    getSubscription(namespace: string): Promise<SubscriptionStatus[]>;
    saveSubscription(namespace: string, subscriptionStatus: SubscriptionStatus[]): Promise<void>;
    getMonitoring(namespace: string): Promise<MonitoringValue>;
    saveMonitoring(namespace: string, monitoring: MonitoringValue): Promise<void>;
}

export interface MalDataSubscriptionOptions {
    config: Config;
    paging: Paging;
    sorting?: Sorting<DataElementsSubscriptionItem>;
    dashboardSorting?: Sorting<DashboardSubscriptionItem>;
    elementType: ElementType;
    sections: string[];
    subscriptionStatus?: string;
    dataElementGroups: string[];
}
