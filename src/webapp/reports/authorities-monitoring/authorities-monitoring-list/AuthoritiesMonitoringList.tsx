import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import i18n from "../../../../locales";
import { DataMonitoringViewModel, getDataMonitoringViews } from "../DataMonitoringViewModel";
import { Filter, Filters } from "./Filters";
import _ from "lodash";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { AuthoritiesMonitoringItem } from "../../../../domain/reports/authorities-monitoring/entities/AuthoritiesMonitoringItem";
import { UserRole } from "../../../../domain/reports/authorities-monitoring/entities/UserPermissions";

export const AuthoritiesMonitoringList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());
    const [sorting, setSorting] = useState<TableSorting<DataMonitoringViewModel>>();
    const [templateGroups, setTemplateGroups] = useState<string[]>([]);
    const [usernameQuery, setUsernameQuery] = useState<string>("");
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, _reload] = useReload();

    useEffect(() => {
        compositionRoot.authMonitoring.getColumns(Namespaces.AUTH_MONITORING_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.authMonitoring]);

    const baseConfig: TableConfig<DataMonitoringViewModel> = useMemo(
        () => ({
            columns: [
                { name: "uid", text: i18n.t("ID"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "username", text: i18n.t("Username"), sortable: false },
                { name: "templateGroups", text: i18n.t("Template Groups"), sortable: false },
                { name: "lastLogin", text: i18n.t("Last login"), sortable: false },
                { name: "roles", text: i18n.t("Role"), sortable: false },
                { name: "authorities", text: i18n.t("Unauthorized privileges"), sortable: false },
            ],
            actions: [],
            initialSorting: {
                field: "name" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
            searchBoxLabel: i18n.t("Search by username..."),
        }),
        []
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataMonitoringViewModel>) => {
            const { pager, objects, templateGroups, userRoles } = await compositionRoot.authMonitoring.get(
                Namespaces.AUTH_MONITORING,
                {
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    ...filters,
                }
            );

            setSorting(sorting);
            setUserRoles(userRoles);
            setTemplateGroups(templateGroups);

            console.debug("Reloading", reloadKey);

            return { pager, objects: getDataMonitoringViews(objects) };
        },
        [compositionRoot.authMonitoring, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataMonitoringViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.authMonitoring.saveColumns(Namespaces.AUTH_MONITORING_USER_COLUMNS, columnKeys);
        },
        [compositionRoot.authMonitoring, visibleColumns]
    );

    const tableProps = useObjectsTable<DataMonitoringViewModel>(baseConfig, getRows);

    const filterOptions = useMemo(() => {
        return {
            usernameQuery: usernameQuery,
            templateGroups: templateGroups,
            userRoles: userRoles,
        };
    }, [templateGroups, userRoles, usernameQuery]);

    const columnsToShow = useMemo<TableColumn<DataMonitoringViewModel>[]>(() => {
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

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: authMonitoringItems } = await compositionRoot.authMonitoring.get(
                Namespaces.AUTH_MONITORING,
                {
                    paging: { page: 1, pageSize: 100000 },
                    sorting: getSortingFromTableSorting(sorting),
                    ...filters,
                }
            );

            compositionRoot.authMonitoring.save("authorities-monitoring-report.csv", authMonitoringItems);
        },
    };

    return (
        <ObjectsList<DataMonitoringViewModel>
            {...tableProps}
            columns={columnsToShow}
            onReorderColumns={saveReorderedColumns}
            onChangeSearch={value => {
                setUsernameQuery(value);
                setFilters({ ...filters, usernameQuery: value });
            }}
            globalActions={[downloadCsv]}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

export function getSortingFromTableSorting(
    sorting: TableSorting<DataMonitoringViewModel>
): Sorting<AuthoritiesMonitoringItem> {
    return {
        field: sorting.field === "uid" ? "name" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(): Filter {
    return {
        templateGroups: [],
        userRoles: [],
        usernameQuery: "",
    };
}
