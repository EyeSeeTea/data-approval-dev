import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useLoading,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import RemoveIcon from "@material-ui/icons/Remove";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    DataApprovalItem,
    parseDataApprovalItemId,
} from "../../../../domain/reports/nhwa-approval-status/entities/DataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter, Filters } from "./Filters";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "dataSet", text: i18n.t("Data set"), sortable: true },
                { name: "attribute", text: i18n.t("Attribute"), sortable: true, hidden: true },
                {
                    name: "completed",
                    text: i18n.t("Completion status"),
                    sortable: true,
                    getValue: row => (row.completed ? "Completed" : "Not completed"),
                },
                {
                    name: "validated",
                    text: i18n.t("Approval status"),
                    sortable: true,
                    getValue: row => (row.validated ? "Approved" : "Ready for approval"),
                },
                { name: "lastUpdatedValue", text: i18n.t("Last updated value"), sortable: true },
            ],
            actions: [
                {
                    name: "complete",
                    text: i18n.t("Complete"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataApprovalItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.dataApproval.updateStatus(items, "complete");
                        if (!result) snackbar.error(i18n.t("Error when trying to complete data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.completed === false),
                },
                {
                    name: "incomplete",
                    text: i18n.t("Incomplete"),
                    icon: <RemoveIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataApprovalItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.dataApproval.updateStatus(items, "incomplete");
                        if (!result) snackbar.error(i18n.t("Error when trying to incomplete data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.completed === true),
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        loading.show(true, i18n.t("Approving data sets..."));
                        const items = _.compact(selectedIds.map(item => parseDataApprovalItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.dataApproval
                            .updateStatus(items, "approve")
                            .catch(() => loading.hide());
                        if (!result) snackbar.error(i18n.t("Error when trying to approve data set"));
                        loading.hide();
                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.validated === false),
                },
                {
                    name: "unapprove",
                    text: i18n.t("Unapprove"),
                    icon: <ClearAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        loading.show(true, i18n.t("Unapproving data sets..."));
                        const items = _.compact(selectedIds.map(item => parseDataApprovalItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.dataApproval
                            .updateStatus(items, "unapprove")
                            .catch(() => loading.hide());
                        if (!result) snackbar.error(i18n.t("Error when trying to unapprove data set"));
                        loading.hide();
                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.validated === true),
                },
            ],
            initialSorting: {
                field: "dataSet" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [loading, compositionRoot, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const { pager, objects } = await compositionRoot.dataApproval.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });

            console.debug("Reloading", reloadKey);

            return { pager, objects: getDataApprovalViews(config, objects) };
        },
        [config, compositionRoot, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataApprovalViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.dataApproval.saveColumns(columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    const columnsToShow = useMemo<TableColumn<DataApprovalViewModel>[]>(() => {
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

    const filterOptions = useMemo(() => getFilterOptions(config), [config]);

    useEffect(() => {
        compositionRoot.dataApproval.getColumns().then(columns => setVisibleColumns(columns));
    }, [compositionRoot]);

    return (
        <ObjectsList<DataApprovalViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getUseCaseOptions(filter: DataSetsFilter) {
    return {
        ...filter,
        orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
    };
}

function getSortingFromTableSorting(sorting: TableSorting<DataApprovalViewModel>): Sorting<DataApprovalItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getFilterOptions(config: Config) {
    return {
        dataSets: sortByName(_.values(config.dataSets)),
        periods: config.years,
        approvalWorkflow: config.approvalWorkflow,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSetsFilter {
    return {
        dataSetIds: [],
        orgUnitPaths: [],
        periods: [],
        completionStatus: undefined,
        approvalStatus: undefined,
    };
}
