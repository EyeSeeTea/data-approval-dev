import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import StorageIcon from "@material-ui/icons/Storage";
import { useReload } from "../../../utils/use-reload";
import { getTwoFactorMonitoringViews, TwoFactorViewModel } from "./TwoFactorViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { MonitoringTwoFactorUser } from "../../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorUser";
import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import { Filter, Filters } from "./Filters";
import { NamedRef } from "../../../../domain/common/entities/Ref";

export const TwoFactorMonitorList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const [filters, setFilters] = useState(() => getEmptyFilter());
    const [sorting, setSorting] = React.useState<TableSorting<TwoFactorViewModel>>();
    const [userGroups, setGroups] = useState<NamedRef[]>([]);
    const [usernameQuery, setUsernameQuery] = useState<string>("");
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, _reload] = useReload();
    useEffect(() => {
        compositionRoot.twoFactorUserMonitoring.getColumns(Namespaces.USER_2FA_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.twoFactorUserMonitoring]);

    const baseConfig: TableConfig<TwoFactorViewModel> = useMemo(
        () => ({
            columns: [
                { name: "id", text: i18n.t("Id"), sortable: true },
                { name: "username", text: i18n.t("Username"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "externalAuth", text: i18n.t("External auth"), sortable: true },
                { name: "twoFA", text: i18n.t("TwoFA"), sortable: true },
                { name: "email", text: i18n.t("Email"), sortable: true, hidden: true },
                { name: "disabled", text: i18n.t("Disabled"), sortable: true, hidden: true },
                { name: "lastLogin", text: i18n.t("Last login"), sortable: true, hidden: true },
                { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true, hidden: true },
                { name: "userGroups", text: i18n.t("User groups"), sortable: true, hidden: true },
                { name: "openId", text: i18n.t("Open ID"), sortable: true, hidden: true },
            ],

            actions: [],
            initialSorting: {
                field: "id" as const,
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

    const getRowsList = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<TwoFactorViewModel>) => {
            const { pager, objects, groups } = await compositionRoot.twoFactorUserMonitoring.get(Namespaces.USER_2FA, {
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            setSorting(sorting);
            setGroups(groups);
            console.debug("Reloading", reloadKey);
            return { pager, objects: getTwoFactorMonitoringViews(objects) };
        },
        [compositionRoot.twoFactorUserMonitoring, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof TwoFactorViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.twoFactorUserMonitoring.saveColumns(Namespaces.USER_2FA_USER_COLUMNS, columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable<TwoFactorViewModel>(baseConfig, getRowsList);

    const filterOptions = useMemo(() => {
        return {
            usernameQuery: usernameQuery,
            groups: userGroups,
        };
    }, [userGroups, usernameQuery]);

    const columnsToShow = useMemo<TableColumn<TwoFactorViewModel>[]>(() => {
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
            const { objects: user2fa } = await compositionRoot.twoFactorUserMonitoring.get(Namespaces.USER_2FA, {
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            compositionRoot.twoFactorUserMonitoring.save("monitoring-twofactor-report.csv", user2fa);
        },
    };

    return (
        <ObjectsList<TwoFactorViewModel>
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

function getSortingFromTableSorting(sorting: TableSorting<TwoFactorViewModel>): Sorting<MonitoringTwoFactorUser> {
    return {
        field: sorting.field === "id" ? "username" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyFilter(): Filter {
    return {
        groups: [],
        usernameQuery: "",
    };
}
