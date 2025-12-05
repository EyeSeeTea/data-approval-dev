import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Config } from "../../../../domain/common/entities/Config";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    MonitoringDetail,
    SubscriptionStatus,
    parseDashboardSubscriptionItemId,
    parseDataElementSubscriptionItemId,
} from "../../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import {
    DashboardSubscriptionViewModel,
    DataElementSubscriptionViewModel,
    getDashboardSubscriptionViews,
    getDataElementSubscriptionViews,
} from "../DataSubscriptionViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { DataSubscriptionFilter, Filters } from "./Filters";
import { NamedRef } from "../../../../domain/common/entities/Base";
import { ClearAll, Done, DoneAll, Remove } from "@material-ui/icons";

export const DataSubscriptionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [visibleDashboardColumns, setVisibleDashboardColumns] = useState<string[]>();
    const [dataElementGroups, setDataElementGroups] = useState<NamedRef[]>([]);
    const [monitoringDetails, setMonitoringDetails] = useState<MonitoringDetail[]>([]);
    const [sections, setSections] = useState<NamedRef[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionStatus[]>([]);
    const [tableRowIds, setTableRowIds] = useState<string[]>([]);
    const [dashboardTableRowIds, setDashboardTableRowIds] = useState<string[]>([]);
    const [reloadKey, reload] = useReload();

    useEffect(() => {
        async function getSubscriptionValues() {
            compositionRoot.malDataSubscription
                .getSubscription(Namespaces.MAL_SUBSCRIPTION_STATUS)
                .then(subscriptionValues => {
                    subscriptionValues = subscriptionValues.length ? subscriptionValues : [];
                    setSubscription(subscriptionValues);
                });
        }
        getSubscriptionValues();
    }, [compositionRoot.malDataApproval, compositionRoot.malDataSubscription]);

    useEffect(() => {
        compositionRoot.malDataSubscription
            .getColumns(Namespaces.MAL_SUBSCRIPTION_STATUS_USER_COLUMNS)
            .then(columns => {
                setVisibleColumns(columns);
            });

        compositionRoot.malDataSubscription
            .getColumns(Namespaces.MAL_DASHBOARD_SUBSCRIPTION_USER_COLUMNS)
            .then(columns => {
                setVisibleDashboardColumns(columns);
            });
    }, [compositionRoot.malDataSubscription]);

    useEffect(() => {
        compositionRoot.malDataSubscription
            .getMonitoringDetails()
            .then(monitoringDetails => setMonitoringDetails(monitoringDetails));
    }, [compositionRoot.malDataSubscription]);

    const getMonitoringValue = useMemo(
        () => async () => {
            return await compositionRoot.malDataSubscription.getMonitoring(Namespaces.MONITORING);
        },
        [compositionRoot.malDataSubscription]
    );

    const getMonitoringJson = useMemo(
        () =>
            (
                initialMonitoringValue: any,
                newValues: { dataSet: string; dataElements: string[] }[],
                enabled: boolean,
                users: string[]
            ) => {
                const { dataElements: initialDataElements } = initialMonitoringValue;
                const dataElements = _.chain(newValues)
                    .groupBy("dataSet")
                    .map((groupedData, dataSet) => ({
                        dataElements: _.flatMap(groupedData, "dataElements"),
                        dataSet,
                        enabled,
                        users,
                    }))
                    .value();

                if (!initialDataElements && !enabled) {
                    return {
                        ...initialMonitoringValue,
                        dataElements: [],
                    };
                } else if (!initialDataElements && enabled) {
                    return {
                        ...initialMonitoringValue,
                        dataElements,
                    };
                } else if (initialDataElements && enabled) {
                    return {
                        ...initialMonitoringValue,
                        dataElements: _.chain(initialDataElements)
                            .concat(dataElements)
                            .groupBy("dataSet")
                            .map(groupedData => ({
                                ...groupedData[0],
                                dataElements: _.union(...groupedData.map(element => element.dataElements)),
                            }))
                            .value(),
                    };
                } else {
                    return {
                        ...initialMonitoringValue,
                        dataElements: _.map(initialDataElements, initialDataElement => {
                            const matchingElement = _.find(dataElements, { dataSet: initialDataElement.dataSet });

                            if (matchingElement) {
                                return {
                                    ...initialDataElement,
                                    dataElements: _.difference(
                                        initialDataElement.dataElements,
                                        matchingElement.dataElements
                                    ),
                                };
                            }
                            return initialDataElement;
                        }),
                    };
                }
            },
        []
    );

    const dataElementSubscriptionAction = useCallback(
        async (selectedIds: string[], subscribed: boolean, subscriptionStatus: SubscriptionStatus[]) => {
            const items = _.compact(selectedIds.map(item => parseDataElementSubscriptionItemId(item)));
            if (items.length === 0) return;

            const subscriptionValues = items
                .filter(
                    item =>
                        subscribed !==
                        subscriptionStatus.find(subscription => subscription.dataElementId === item.dataElementId)
                            ?.subscribed
                )
                .map(item => {
                    return {
                        subscribed,
                        dataElementId: item.dataElementId,
                        lastDateOfSubscription: new Date().toISOString(),
                        user: config.currentUser.id,
                    };
                });

            const monitoringValues = items.map(item => {
                const monitoringDetail = monitoringDetails.find(
                    monitoringDetail => monitoringDetail.dataElementId === item.dataElementId
                );

                return {
                    dataSet: monitoringDetail?.dataSet ?? "",
                    dataElements: [monitoringDetail?.dataElementCode ?? ""],
                    enabled: subscribed,
                    users: [config.currentUser.id],
                };
            });

            const monitoring = await getMonitoringValue();

            await compositionRoot.malDataSubscription.saveMonitoring(
                Namespaces.MONITORING,
                getMonitoringJson(monitoring, monitoringValues, subscribed, [config.currentUser.id])
            );
            await compositionRoot.malDataSubscription.saveSubscription(
                Namespaces.MAL_SUBSCRIPTION_STATUS,
                combineSubscriptionValues(subscriptionStatus, subscriptionValues)
            );
        },
        [
            compositionRoot.malDataSubscription,
            config.currentUser.id,
            getMonitoringJson,
            getMonitoringValue,
            monitoringDetails,
        ]
    );

    const dashboardSubscriptionAction = useCallback(
        async (selectedIds: string[], subscribed: boolean, subscriptionStatus: SubscriptionStatus[]) => {
            const items = _.compact(selectedIds.map(item => parseDashboardSubscriptionItemId(item)));
            if (items.length === 0) return;

            const subscriptionValues = items.flatMap(item =>
                item.dataElementIds
                    .filter(
                        item =>
                            subscribed !==
                            subscriptionStatus.find(subscription => subscription.dataElementId === item)?.subscribed
                    )
                    .map(dataElementId => {
                        return {
                            dataElementId,
                            subscribed,
                            lastDateOfSubscription: new Date().toISOString(),
                            user: config.currentUser.id,
                        };
                    })
            );

            const monitoringValues = items.flatMap(item =>
                item.dataElementIds.map(item => {
                    const monitoringDetail = monitoringDetails.find(
                        monitoringDetail => monitoringDetail.dataElementId === item
                    );

                    return {
                        dataSet: monitoringDetail?.dataSet ?? "",
                        dataElements: [monitoringDetail?.dataElementCode ?? ""],
                        enabled: subscribed,
                        users: [config.currentUser.id],
                    };
                })
            );

            const monitoring = await getMonitoringValue();

            await compositionRoot.malDataSubscription.saveMonitoring(
                Namespaces.MONITORING,
                getMonitoringJson(monitoring, monitoringValues, subscribed, [config.currentUser.id])
            );
            await compositionRoot.malDataSubscription.saveSubscription(
                Namespaces.MAL_SUBSCRIPTION_STATUS,
                combineSubscriptionValues(subscriptionStatus, subscriptionValues)
            );
        },
        [
            compositionRoot.malDataSubscription,
            config.currentUser.id,
            monitoringDetails,
            getMonitoringJson,
            getMonitoringValue,
        ]
    );

    const baseConfig: TableConfig<DataElementSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataElementName", text: i18n.t("Data Element"), sortable: true },
                {
                    name: "subscription",
                    text: i18n.t("Subscription status"),
                    sortable: true,
                    getValue: row => (row.subscription ? "Subscribed" : "Not subscribed"),
                },
                { name: "section", text: i18n.t("Sections"), sortable: true, getValue: row => row.section?.name ?? "" },
                {
                    name: "lastDateOfSubscription",
                    text: i18n.t("Last Date of Subscription"),
                    sortable: true,
                    hidden: true,
                },
            ],
            actions: [
                {
                    name: "subscribe",
                    text: i18n.t("Subscribe"),
                    icon: <Done />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dataElementSubscriptionAction(selectedIds, true, subscription);
                        reload();
                    },
                    isActive: rows => rows.length === 1 && _.every(rows, row => !row.subscription),
                },
                {
                    name: "subscribeToAll",
                    text: i18n.t("Subscribe to selected items"),
                    icon: <Done />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dataElementSubscriptionAction(selectedIds, true, subscription);
                        reload();
                    },
                    isActive: rows => rows.length > 1 && _.some(rows, row => !row.subscription),
                },
                {
                    name: "unsubscribe",
                    text: i18n.t("Unsubscribe"),
                    icon: <Remove />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dataElementSubscriptionAction(selectedIds, false, subscription);
                        reload();
                    },
                    isActive: rows => rows.length === 1 && _.every(rows, row => row.subscription),
                },
                {
                    name: "unsubscribeToAll",
                    text: i18n.t("Unsubscribe to selected items"),
                    icon: <Done />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dataElementSubscriptionAction(selectedIds, false, subscription);
                        reload();
                    },
                    isActive: rows => rows.length > 1 && _.some(rows, row => row.subscription),
                },
            ],
            initialSorting: {
                field: "dataElementName" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [reload, subscription, dataElementSubscriptionAction]
    );

    const dashboardBaseConfig: TableConfig<DashboardSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                {
                    name: "name",
                    text: i18n.t(filters.elementType === "dashboards" ? "Dashboard" : "Visualization"),
                    sortable: true,
                },
                {
                    name: "subscription",
                    text: i18n.t("Subscription status"),
                },
                {
                    name: "subscribedElements",
                    text: i18n.t("Subscribed raw elements"),
                },
                {
                    name: "lastDateOfSubscription",
                    text: i18n.t("Last Date of Subscription"),
                    hidden: true,
                },
            ],
            actions: [
                {
                    name: "subscribeToAll",
                    text: i18n.t("Subscribe to all children"),
                    icon: <DoneAll />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dashboardSubscriptionAction(selectedIds, true, subscription);
                        reload();
                    },
                    isActive: rows =>
                        _.every(
                            rows,
                            row =>
                                (row.subscription === "Not Subscribed" ||
                                    row.subscription === "Subscribed to some elements") &&
                                !_.isEmpty(row.children)
                        ),
                },
                {
                    name: "subscribe",
                    text: i18n.t("Subscribe"),
                    icon: <Done />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dashboardSubscriptionAction(selectedIds, true, subscription);
                        reload();
                    },
                    isActive: rows =>
                        _.some(
                            rows,
                            row => row.subscription === "Not Subscribed" && row.id.split("-")[0] !== "dashboard"
                        ),
                },
                {
                    name: "unsubscribeToAll",
                    text: i18n.t("Unsubscribe to all children"),
                    icon: <ClearAll />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dashboardSubscriptionAction(selectedIds, false, subscription);
                        reload();
                    },
                    isActive: rows =>
                        _.every(
                            rows,
                            row =>
                                (row.subscription === "Subscribed" ||
                                    row.subscription === "Subscribed to some elements") &&
                                !_.isEmpty(row.children)
                        ),
                },
                {
                    name: "unsubscribe",
                    text: i18n.t("Unsubscribe"),
                    icon: <Remove />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        await dashboardSubscriptionAction(selectedIds, false, subscription);
                        reload();
                    },
                    isActive: rows =>
                        _.some(rows, row => row.subscription === "Subscribed" && row.id.split("-")[0] !== "dashboard"),
                },
            ],
            initialSorting: {
                field: "name" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [filters.elementType, reload, subscription, dashboardSubscriptionAction]
    );

    const getRows = useMemo(
        () =>
            async (
                _search: string,
                paging: TablePagination,
                sorting: TableSorting<DataElementSubscriptionViewModel>
            ) => {
                const { dataElementGroups, objects, pager, sections, totalRows } =
                    await compositionRoot.malDataSubscription.get({
                        config,
                        paging: { page: paging.page, pageSize: paging.pageSize },
                        sorting: getSortingFromTableSorting(sorting),
                        ...filters,
                    });

                setSections(sections ?? []);
                setDataElementGroups(dataElementGroups ?? []);
                setTableRowIds(getDataElementSubscriptionViews(config, totalRows).map(dataElement => dataElement.id));

                console.debug("Reloading", reloadKey);

                return { pager, objects: getDataElementSubscriptionViews(config, objects) };
            },
        [compositionRoot.malDataSubscription, config, filters, reloadKey]
    );

    const getDashboardRows = useMemo(
        () =>
            async (_search: string, paging: TablePagination, sorting: TableSorting<DashboardSubscriptionViewModel>) => {
                const { pager, objects, totalRows } =
                    await compositionRoot.malDataSubscription.getDashboardDataElements({
                        config,
                        paging: { page: paging.page, pageSize: paging.pageSize },
                        dashboardSorting: getSortingFromDashboardTableSorting(sorting),
                        ...filters,
                    });

                setDashboardTableRowIds(
                    getDashboardSubscriptionViews(config, totalRows).map(dataElement => dataElement.id)
                );

                console.debug("Reloading", reloadKey);
                return { pager, objects: getDashboardSubscriptionViews(config, objects) };
            },
        [compositionRoot.malDataSubscription, config, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataElementSubscriptionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_SUBSCRIPTION_STATUS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot.malDataSubscription, visibleColumns]
    );

    const saveReorderedDashboardColumns = useCallback(
        async (columnKeys: Array<keyof DashboardSubscriptionViewModel>) => {
            if (!visibleDashboardColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_DASHBOARD_SUBSCRIPTION_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot.malDataSubscription, visibleDashboardColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);
    const dashboardTableProps = useObjectsTable(dashboardBaseConfig, getDashboardRows);

    const columnsToShow = useMemo<TableColumn<DataElementSubscriptionViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]);

    const dashboardColumnsToShow = useMemo<TableColumn<DashboardSubscriptionViewModel>[]>(() => {
        if (!visibleDashboardColumns || _.isEmpty(visibleDashboardColumns)) return dashboardTableProps.columns;

        const indexes = _(visibleDashboardColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(dashboardTableProps.columns)
            .map(column => ({ ...column, hidden: !visibleDashboardColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [dashboardTableProps.columns, visibleDashboardColumns]);

    const getFilterOptions = useCallback(
        (_config: Config) => {
            return {
                sections,
                dataElementGroups,
                subscription: ["Subscribed", "Not Subscribed", "Subscribed to some elements"],
            };
        },
        [sections, dataElementGroups]
    );

    const filterOptions = React.useMemo(() => getFilterOptions(config), [config, getFilterOptions]);

    function combineSubscriptionValues(
        initialSubscriptionValues: SubscriptionStatus[],
        addedSubscriptionValues: SubscriptionStatus[]
    ): SubscriptionStatus[] {
        const combinedSubscriptionValues = addedSubscriptionValues.map(added => {
            return initialSubscriptionValues.filter(initial => initial.dataElementId !== added.dataElementId);
        });
        const combinedSubscription = _.union(_.intersection(...combinedSubscriptionValues), addedSubscriptionValues);
        setSubscription(combinedSubscription);

        return _.union(combinedSubscription);
    }

    return (
        <>
            {filters.elementType === "dataElements" ? (
                <ObjectsList<DataElementSubscriptionViewModel>
                    {...tableProps}
                    columns={columnsToShow}
                    ids={tableRowIds}
                    onChangeSearch={undefined}
                    onReorderColumns={saveReorderedColumns}
                >
                    <Filters values={filters} options={filterOptions} onChange={setFilters} />
                </ObjectsList>
            ) : (
                <ObjectsList<DashboardSubscriptionViewModel>
                    {...dashboardTableProps}
                    columns={dashboardColumnsToShow}
                    ids={dashboardTableRowIds}
                    onChangeSearch={undefined}
                    onReorderColumns={saveReorderedDashboardColumns}
                    childrenKeys={["children"]}
                >
                    <Filters values={filters} options={filterOptions} onChange={setFilters} />
                </ObjectsList>
            )}
        </>
    );
});

function getSortingFromTableSorting(
    sorting: TableSorting<DataElementSubscriptionViewModel>
): Sorting<DataElementsSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "dataElementName" : sorting.field,
        direction: sorting.order,
    };
}

function getSortingFromDashboardTableSorting(
    sorting: TableSorting<DashboardSubscriptionViewModel>
): Sorting<DashboardSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "name" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSubscriptionFilter {
    return {
        sections: [],
        dataElementIds: [],
        elementType: "dataElements",
        dataElementGroups: [],
        subscriptionStatus: undefined,
    };
}
