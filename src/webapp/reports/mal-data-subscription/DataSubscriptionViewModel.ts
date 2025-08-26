import { NamedRef } from "../../../domain/common/entities/Base";
import { Config } from "../../../domain/common/entities/Config";
import {
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    SubscriptionValue,
    getDashboardSubscriptionItemId,
    getDataElementSubscriptionItemId,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";

export interface DataElementSubscriptionViewModel {
    id: string;
    dataElementName: string;
    dataElementId: string;
    section: NamedRef | undefined;
    subscription: boolean;
    lastDateOfSubscription: string;
}

export interface DashboardSubscriptionViewModel {
    id: string;
    name: string;
    subscribedElements: string;
    subscription: SubscriptionValue;
    lastDateOfSubscription: string;
    children: NamedRef[];
}

export function getDataElementSubscriptionViews(
    _config: Config,
    items: DataElementsSubscriptionItem[]
): DataElementSubscriptionViewModel[] {
    return items.map(item => {
        return {
            id: getDataElementSubscriptionItemId(item),
            subscription: item.subscription,
            dataElementName: item.dataElementName,
            dataElementId: item.dataElementId,
            section: item.section,
            lastDateOfSubscription: item.lastDateOfSubscription,
        };
    });
}

export function getDashboardSubscriptionViews(
    _config: Config,
    items: DashboardSubscriptionItem[]
): DashboardSubscriptionViewModel[] {
    return items.map(item => {
        return {
            id: getDashboardSubscriptionItemId(item),
            name: item.name,
            subscription: item.subscription,
            subscribedElements: item.subscribedElements,
            lastDateOfSubscription: item.lastDateOfSubscription,
            children: item.children,
        };
    });
}
