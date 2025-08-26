import _ from "lodash";
import { D2Api, MetadataPick } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import {
    ChildrenDataElement,
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    MalSubscriptionPaginatedObjects,
    MonitoringDetail,
    MonitoringValue,
    SubscriptionStatus,
    SubscriptionValue,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionOptions,
    MalDataSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/MalDataSubscriptionRepository";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { NamedRef } from "../../../domain/common/entities/Base";
import { paginate } from "../../../domain/common/entities/PaginatedObjects";

interface Visualization {
    id: string;
    name: string;
    dataDimensionItems: DataDimensionItems[] | undefined;
}

interface Dashboard {
    id: string;
    name: string;
    dashboardItems: {
        visualization: {
            dataDimensionItems: DataDimensionItems[] | undefined;
        };
    }[];
}

interface DataDimensionItems {
    indicator:
        | {
              numerator: string;
              denominator: string;
          }
        | undefined;
}

export class MalDataSubscriptionDefaultRepository implements MalDataSubscriptionRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(
        options: MalDataSubscriptionOptions
    ): Promise<MalSubscriptionPaginatedObjects<DataElementsSubscriptionItem>> {
        const {
            dataElementGroups: dataElementGroupIds,
            subscriptionStatus,
            sections: sectionIds,
            elementType,
            sorting,
            paging,
        } = options;
        if (!sorting || elementType !== "dataElements") return emptyPage;

        const subscriptionValues =
            (await this.globalStorageClient.getObject<SubscriptionStatus[]>(Namespaces.MAL_SUBSCRIPTION_STATUS)) ?? [];

        const dataElementFields = {
            id: true,
            name: true,
            code: true,
            dataElementGroups: { id: true, name: true },
            dataSetElements: {
                dataSet: {
                    id: true,
                    name: true,
                    sections: {
                        id: true,
                        name: true,
                        dataElements: { fields: { id: true } },
                    },
                },
            },
        } as const;

        type D2DataElement = MetadataPick<{
            dataElements: { fields: typeof dataElementFields };
        }>["dataElements"][number];

        const { dataElements } = await this.api
            .get<{ dataElements: D2DataElement[] }>(`/dataElements`, {
                filters: [
                    "name:ilike:apvd",
                    `dataElementGroups.id:in:${dataElementGroupIds.join(",")}`,
                    `dataSetElements.dataSet.sections.id:in:${sectionIds.join(",")}`,
                ],
                fields: "id,name,code,dataElementGroups[id,name],dataSetElements[dataSet[id,name,sections[id,name,dataElements]]]",
                paging: false,
            })
            .getData();

        const rows = dataElements
            .map(dataElement => {
                const subscriptionValue = subscriptionValues.find(
                    subscription => subscription.dataElementId === dataElement.id
                );

                const section: NamedRef | undefined = _.chain(dataElement.dataSetElements)
                    .flatMap("dataSet.sections")
                    .find(section => _.some(section.dataElements, { id: dataElement.id }))
                    .value();

                return {
                    dataElementId: dataElement.id,
                    dataElementName: dataElement.name,
                    subscription: !!subscriptionValue?.subscribed,
                    lastDateOfSubscription: subscriptionValue?.lastDateOfSubscription ?? "",
                    section,
                    dataElementGroups: dataElement.dataElementGroups,
                };
            })
            .filter(row => {
                const isSubscribed = !!(!subscriptionStatus
                    ? row
                    : (subscriptionStatus === "Subscribed") === row.subscription);
                const isInSection = !!(_.isEmpty(sectionIds) ? row : _.includes(sectionIds, row.section?.id));
                const isInDataElementGroup = !!(_.isEmpty(dataElementGroupIds)
                    ? row
                    : _.intersection(
                          dataElementGroupIds,
                          row.dataElementGroups.map(dataElementGroup => dataElementGroup.id)
                      ).length > 0);

                return isSubscribed && isInSection && isInDataElementGroup;
            });

        const sections = _(rows)
            .map(row => row.section)
            .compact()
            .uniqBy("id")
            .value();

        const dataElementGroups = _(rows)
            .flatMap(row => row.dataElementGroups)
            .uniqBy("id")
            .value();

        const { objects, pager } = paginate(rows, paging, sorting);

        return { pager, objects, sections, dataElementGroups, totalRows: rows };
    }

    async getChildrenDataElements(
        options: MalDataSubscriptionOptions
    ): Promise<MalSubscriptionPaginatedObjects<DashboardSubscriptionItem>> {
        const { dashboardSorting, subscriptionStatus, elementType, paging } = options;
        if (!dashboardSorting || elementType === "dataElements") return emptyPage;

        const subscriptionValues =
            (await this.globalStorageClient.getObject<SubscriptionStatus[]>(Namespaces.MAL_SUBSCRIPTION_STATUS)) ?? [];

        const { dataElements } = await this.api
            .get<{ dataElements: ChildrenDataElement[] }>(
                "/dataElements?fields=id,name,code,dataElementGroups[id,name],dataSetElements[dataSet[id,name]]&paging=false"
            )
            .getData();

        if (elementType === "dashboards") {
            const { dashboards } = await this.api
                .get<{
                    dashboards: Dashboard[];
                }>(
                    "/dashboards?fields=id,name,dashboardItems[visualization[dataDimensionItems[indicator[id,name,numerator,denominator]]]]"
                )
                .getData();

            const dataElementsInDashboard = dashboards.map(dashboard =>
                getDataElementsInParent(
                    dashboard,
                    _(dashboard.dashboardItems)
                        ?.map(item => item.visualization?.dataDimensionItems)
                        .flatten()
                        .compact()
                        .value(),
                    dataElements
                )
            );

            const rows: DashboardSubscriptionItem[] = dashboards
                .map(dashboard => getRows(dashboard, dataElementsInDashboard, subscriptionValues))
                .filter(row => (!subscriptionStatus ? row : subscriptionStatus === row.subscription));

            const { objects, pager } = paginate(rows, paging, dashboardSorting);

            return { pager, objects, totalRows: rows };
        } else if (elementType === "visualizations") {
            const { visualizations } = await this.api
                .get<{
                    visualizations: Visualization[];
                }>("/visualizations?fields=id,name,dataDimensionItems[indicator[id,name,numerator,denominator]]")
                .getData();

            const dataElementsInVisualization = visualizations.map(visualization =>
                getDataElementsInParent(visualization, visualization.dataDimensionItems, dataElements)
            );

            const rows: DashboardSubscriptionItem[] = visualizations
                .map(visualization => getRows(visualization, dataElementsInVisualization, subscriptionValues))
                .filter(row => (!subscriptionStatus ? row : subscriptionStatus === row.subscription));

            const { objects, pager } = paginate(rows, paging, dashboardSorting);

            return { pager, objects, totalRows: rows };
        } else {
            return emptyPage;
        }
    }

    async getMonitoringDetails(): Promise<MonitoringDetail[]> {
        const { dataElements } = await this.api
            .get<{
                dataElements: {
                    id: string;
                    code: string;
                    dataSetElements: {
                        dataSet: NamedRef;
                    }[];
                }[];
            }>(`/dataElements?fields=id,code,dataSetElements[dataSet[id,name]]&paging=false`)
            .getData();

        const dataElementsMonitoringDetails: MonitoringDetail[] = dataElements
            .filter(dataElement => dataElement.code)
            .map(dataElement => {
                const dataSetName =
                    dataElement.dataSetElements.find(({ dataSet }) => dataSet.name.includes("APVD"))?.dataSet.name ??
                    dataElement.dataSetElements[0]?.dataSet.name ??
                    "";

                return {
                    dataElementId: dataElement.id,
                    dataElementCode: dataElement.code,
                    dataSet: dataSetName,
                };
            });

        return dataElementsMonitoringDetails;
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async getSubscription(namespace: string): Promise<any[]> {
        const subscription = await this.globalStorageClient.getObject<SubscriptionStatus[]>(namespace);

        return subscription ?? [];
    }

    async saveSubscription(namespace: string, subscription: SubscriptionStatus[]): Promise<void> {
        return await this.globalStorageClient.saveObject<SubscriptionStatus[]>(namespace, subscription);
    }

    async getMonitoring(namespace: string): Promise<MonitoringValue> {
        const monitoring = (await this.globalStorageClient.getObject<MonitoringValue>(namespace)) ?? {
            dataElements: [],
        };

        return monitoring;
    }

    async saveMonitoring(namespace: string, monitoring: MonitoringValue): Promise<void> {
        return await this.globalStorageClient.saveObject<MonitoringValue>(namespace, monitoring);
    }
}

function getDataElementsInParent(
    parent: Dashboard | Visualization,
    dataDimensionItems: DataDimensionItems[] | undefined,
    dataElements: ChildrenDataElement[]
) {
    const indicatorVariables = _(dataDimensionItems)
        ?.map(dimensionItem => [dimensionItem.indicator?.numerator, dimensionItem.indicator?.denominator])
        .flattenDeep()
        .compact()
        .value();

    const dataElementVariables = _.uniq(
        _.compact(_.flatMap(indicatorVariables, str => str.match(/#{([a-zA-Z0-9]+)}/g)))
    );

    const dataElementIds = dataElementVariables
        .map(token => token.slice(2, -1))
        .filter(id => /^[a-zA-Z0-9]+$/.test(id));

    const dataElementsWithGroups = _.filter(dataElements, dataElement => dataElementIds.includes(dataElement.id));

    return _({
        dataElementsWithGroups,
    })
        .keyBy(_item => parent.id)
        .value();
}

function getRows(
    parent: Dashboard | Visualization,
    dataElementsInParent: Record<string, ChildrenDataElement[]>[],
    subscriptionValues: SubscriptionStatus[]
) {
    const children: ChildrenDataElement[] = (findArrayValueById(parent.id, dataElementsInParent) ?? []).map(child => {
        const dataSetName =
            child.dataSetElements.find((item: any) => item.dataSet.name.includes("APVD"))?.dataSet.name ??
            child.dataSetElements[0]?.dataSet.name ??
            "";

        return {
            ...child,
            dataSetName,
            subscription: subscriptionValues.find(subscription => subscription.dataElementId === child.id)?.subscribed
                ? "Subscribed"
                : "Not Subscribed",
            lastDateOfSubscription:
                subscriptionValues.find(subscription => subscription.dataElementId === child.id)
                    ?.lastDateOfSubscription ?? "",
        };
    });

    const subscribedElements = _.intersection(
        subscriptionValues
            .filter(subscription => subscription.subscribed)
            .map(subscription => subscription.dataElementId),
        children.map(child => child.id)
    ).length;

    const subscription: SubscriptionValue =
        subscribedElements !== 0 && subscribedElements !== children.length
            ? "Subscribed to some elements"
            : subscribedElements !== 0 && subscribedElements === children.length
            ? "Subscribed"
            : "Not Subscribed";

    return {
        ...parent,
        children,
        subscribedElements: !_.isEmpty(children)
            ? `${subscribedElements} / ${children.length}`
            : String(subscribedElements),
        subscription,
        lastDateOfSubscription:
            _.maxBy(
                children.map(child => child.lastDateOfSubscription),
                dateString => new Date(dateString).getTime()
            ) ?? "",
    };
}

const emptyPage = {
    pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 },
    objects: [],
    totalRows: [],
};

function findArrayValueById(id: string, record: Record<string, any[]>[]) {
    const entry = _.find(record, obj => id in obj);
    return entry ? entry[id] : [];
}
