import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TableGlobalAction,
    TableSorting,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import RemoveIcon from "@material-ui/icons/Remove";
import RestartAltIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { MalDataApprovalItem } from "../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter, Filters } from "./Filters";
import { DataDifferencesList } from "../DataDifferencesList";
import { PlaylistAddCheck, ThumbUp } from "@material-ui/icons";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { emptyApprovalFilter } from "./hooks/useDataApprovalFilters";
import { useDataApprovalListColumns } from "./hooks/useDataApprovalListColumns";
import { useActiveDataApprovalActions } from "./hooks/useActiveDataApprovalActions";
import { useDataApprovalActions } from "./hooks/useDataApprovalActions";
import { useSelectablePeriods } from "./hooks/useSelectablePeriods";

const defaultSorting: TableSorting<DataApprovalViewModel> = {
    field: "dataSet",
    order: "asc",
};

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();
    const [filters, setFilters] = useState(emptyApprovalFilter);
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [__, setDiffState] = useState<string>("");
    const [oldPeriods, setOldPeriods] = useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [page] = React.useState(1);
    const [pageSize] = React.useState(50);
    const [rows, setRows] = React.useState<DataApprovalViewModel[]>([]);

    const activeActions = useActiveDataApprovalActions();
    const {
        globalMessage,
        modalActions: { closeDataDifferencesDialog, isDialogOpen, revoke },
        onTableActionClick,
        reloadKey,
        selectedIds,
    } = useDataApprovalActions();
    const { columns } = useDataApprovalListColumns();
    const selectablePeriods = useSelectablePeriods(oldPeriods);

    useEffect(() => {
        if (globalMessage?.type === "error") snackbar.error(globalMessage.message);
        else if (globalMessage?.type === "success") snackbar.success(globalMessage.message);
    }, [globalMessage, snackbar]);

    useEffect(() => {
        compositionRoot.malDataApproval.getColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    // useEffect(() => {
    //     if (filters.dataSetId) compositionRoot.malDataApproval.saveMalDiffNames(filters.dataSetId);
    // }, [compositionRoot, filters.dataSetId]);

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: columns,
            actions: [
                {
                    name: "complete",
                    text: i18n.t("Complete"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: onTableActionClick.completeAction,
                    isActive: activeActions.isCompleteActionVisible,
                },
                {
                    name: "incomplete",
                    text: i18n.t("Incomplete"),
                    icon: <RemoveIcon />,
                    multiple: true,
                    onClick: onTableActionClick.incompleteAction,
                    isActive: activeActions.isIncompleteActionVisible,
                },
                {
                    name: "submit",
                    text: i18n.t("Submit"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: onTableActionClick.submitAction,
                    isActive: activeActions.isSubmitActionVisible,
                },
                {
                    name: "revoke",
                    text: i18n.t("Revoke"),
                    icon: <ClearAllIcon />,
                    multiple: true,
                    onClick: onTableActionClick.revokeAction,
                    isActive: activeActions.isRevokeActionVisible,
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: onTableActionClick.approveAction,
                    isActive: activeActions.isApproveActionVisible,
                },
                {
                    name: "getDiff",
                    text: i18n.t("Check Difference"),
                    icon: <PlaylistAddCheck />,
                    onClick: onTableActionClick.getDifferenceAction,
                    isActive: activeActions.isGetDifferenceActionVisible,
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
        [
            columns,
            onTableActionClick.completeAction,
            onTableActionClick.incompleteAction,
            onTableActionClick.submitAction,
            onTableActionClick.revokeAction,
            onTableActionClick.approveAction,
            onTableActionClick.getDifferenceAction,
            activeActions.isCompleteActionVisible,
            activeActions.isIncompleteActionVisible,
            activeActions.isSubmitActionVisible,
            activeActions.isRevokeActionVisible,
            activeActions.isApproveActionVisible,
            activeActions.isGetDifferenceActionVisible,
        ]
    );

    React.useEffect(() => {
        let isCancelled = false;
        async function getData() {
            setIsLoading(true);
            try {
                const { objects } = await compositionRoot.malDataApproval.get(Namespaces.MONITORING, {
                    config: config,
                    paging: { page: 1, pageSize: 1000 },
                    sorting: getSortingFromTableSorting(defaultSorting),
                    useOldPeriods: oldPeriods,
                    ...getUseCaseOptions(filters, selectablePeriods),
                });

                if (isCancelled) return;

                console.debug("Reloading", reloadKey);
                setRows(getDataApprovalViews(objects));
                setIsLoading(false);
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        getData();

        return () => {
            isCancelled = true;
        };
    }, [compositionRoot.malDataApproval, config, oldPeriods, filters, selectablePeriods, reloadKey]);

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataApprovalViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataApproval.saveColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const columnsToShow = useMemo<TableColumn<DataApprovalViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return baseConfig.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(baseConfig.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [baseConfig.columns, visibleColumns]);

    const filterOptions = useMemo(() => getFilterOptions(config, selectablePeriods), [config, selectablePeriods]);

    const periodsToggle: TableGlobalAction = {
        name: "switchPeriods",
        text: i18n.t(oldPeriods ? "Use recent periods" : "Use old periods"),
        icon: <RestartAltIcon />,
        onClick: async () => {
            setOldPeriods(oldYears => !oldYears);
            setFilters(prev => ({ ...prev, periods: [] }));
        },
    };

    return (
        <React.Fragment>
            <ObjectsList<DataApprovalViewModel>
                {...baseConfig}
                globalActions={[periodsToggle]}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
                reload={console.debug}
                isLoading={isLoading}
                onChange={console.debug}
                pagination={{ page: page, pageSize: pageSize, total: rows.length }}
                searchBoxLabel=""
                rows={isLoading ? [] : rows}
            >
                <Filters
                    hideDataSets={false} // perhaps show datasets based on user permissions?
                    values={filters}
                    options={filterOptions}
                    onChange={setFilters}
                />
            </ObjectsList>
            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Check differences")}
                onCancel={closeDataDifferencesDialog}
                cancelText={i18n.t("Close")}
                maxWidth="md"
                fullWidth
            >
                <DataDifferencesList
                    selectedIds={selectedIds}
                    dataSetId={filters.dataSetIds[0] ?? ""}
                    revoke={revoke}
                    isUpdated={() => setDiffState(`${new Date().getTime()}`)}
                    key={new Date().getTime()}
                />
            </ConfirmationDialog>
        </React.Fragment>
    );
});

function getSortingFromTableSorting(sorting: TableSorting<DataApprovalViewModel>): Sorting<MalDataApprovalItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getUseCaseOptions(filter: DataSetsFilter, selectablePeriods: string[]) {
    return {
        ...filter,
        periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
        orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
    };
}

function getFilterOptions(config: Config, selectablePeriods: string[]) {
    return {
        dataSets: sortByName(_.values(config.dataSets)),
        periods: selectablePeriods,
        approvalWorkflow: config.approvalWorkflow,
    };
}
