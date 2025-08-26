import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import { Button, Typography } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Namespaces } from "../../../data/common/clients/storage/Namespaces";
import { Sorting } from "../../../domain/common/entities/PaginatedObjects";
import { IndicatorItem, ProgramIndicatorItem } from "../../../domain/reports/data-quality/entities/DataQualityItem";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import {
    IndicatorViewModel,
    ProgramIndicatorViewModel,
    getDataQualityIndicatorViews,
    getDataQualityProgramIndicatorViews,
} from "./DataQualityViewModel";
import { useBooleanState } from "../../utils/use-boolean";
import ReloadWarningModal from "../../components/reload_warning/ReloadWarningModal";

export const DataQualityList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [visibleIndicatorColumns, setVisibleIndicatorColumns] = useState<string[]>();
    const [visibleProgramIndicatorColumns, setVisibleProgramIndicatorColumns] = useState<string[]>();
    const [isReloadModal, { enable: openReloadModal, disable: closeReloadModal }] = useBooleanState(false);
    const [isReloading, { enable: confirmReload, disable: stopReloading }] = useBooleanState(false);
    const [isLoading, { enable: startLoading, disable: stopLoading }] = useBooleanState(false);

    useEffect(() => {
        compositionRoot.dataQuality.getColumns(Namespaces.INDICATOR_STATUS_USER_COLUMNS).then(columns => {
            setVisibleIndicatorColumns(columns);
        });
        compositionRoot.dataQuality.getColumns(Namespaces.PROGRAM_INDICATOR_STATUS_USER_COLUMNS).then(columns => {
            setVisibleProgramIndicatorColumns(columns);
        });
    }, [compositionRoot]);

    const loadValidationData = useCallback(async () => {
        await compositionRoot.dataQuality.loadValidation();
    }, [compositionRoot.dataQuality]);

    const reloadValidationData = useCallback(async () => {
        await compositionRoot.dataQuality.resetValidation();
    }, [compositionRoot.dataQuality]);

    useEffect(() => {
        if (isReloading) {
            closeReloadModal();
            reloadValidationData().then(() => stopReloading());
        }
    }, [reloadValidationData, isReloading, stopReloading, closeReloadModal]);

    useEffect(() => {
        startLoading();
        loadValidationData().then(() => stopLoading());
    }, [loadValidationData, startLoading, stopLoading]);

    const indicatorBaseConfig: TableConfig<IndicatorViewModel> = useMemo(
        () => ({
            columns: [
                { name: "id", text: i18n.t("Id"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "user", text: i18n.t("Created By"), sortable: true },
                { name: "lastUpdated", text: i18n.t("Last Updated"), sortable: true },
                { name: "denominator", text: i18n.t("Denominator"), sortable: true },
                {
                    name: "denominatorResult",
                    text: i18n.t("Valid denominator"),
                    sortable: false,
                    getValue: row => (row.denominatorResult ? i18n.t("Valid") : i18n.t("Invalid")),
                },
                { name: "numerator", text: i18n.t("Numerator"), sortable: true },
                {
                    name: "numeratorResult",
                    text: i18n.t("Valid Numerator"),
                    sortable: false,
                    getValue: row => (row.numeratorResult ? i18n.t("Valid") : i18n.t("Invalid")),
                },
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
        }),
        []
    );

    const programIndicatorBaseConfig: TableConfig<ProgramIndicatorViewModel> = useMemo(
        () => ({
            columns: [
                { name: "id", text: i18n.t("Id"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "user", text: i18n.t("Created By"), sortable: true },
                { name: "lastUpdated", text: i18n.t("Last Updated"), sortable: true },
                { name: "expression", text: i18n.t("Expression"), sortable: true },
                {
                    name: "expressionResult",
                    text: i18n.t("Valid expression"),
                    sortable: false,
                    getValue: row => (row.expressionResult ? i18n.t("Valid") : i18n.t("Invalid")),
                },
                { name: "filter", text: i18n.t("Filter"), sortable: true },
                {
                    name: "filterResult",
                    text: i18n.t("Valid filter"),
                    sortable: false,
                    getValue: row =>
                        row.filterResult
                            ? i18n.t("Valid")
                            : row.filterResult === undefined
                            ? i18n.t("Empty")
                            : i18n.t("Invalid"),
                },
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
        }),
        []
    );

    const getIndicatorRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<IndicatorViewModel>) => {
            const { pager, objects } = await compositionRoot.dataQuality.getIndicators(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getIndicatorSortingFromTableSorting(sorting),
                },
                Namespaces.DATA_QUALITY
            );

            console.debug("load: ", isLoading, "reload: ", isReloading);
            return {
                pager,
                objects: getDataQualityIndicatorViews(config, objects),
            };
        },
        [compositionRoot.dataQuality, config, isLoading, isReloading]
    );

    const getProgramIndicatorRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<ProgramIndicatorViewModel>) => {
            const { pager, objects } = await compositionRoot.dataQuality.getProgramIndicators(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getProgramIndicatorSortingFromTableSorting(sorting),
                },
                Namespaces.DATA_QUALITY
            );

            console.debug("load: ", isLoading, "reload: ", isReloading);
            return {
                pager,
                objects: getDataQualityProgramIndicatorViews(config, objects),
            };
        },
        [compositionRoot.dataQuality, config, isLoading, isReloading]
    );

    const saveReorderedIndicatorColumns = useCallback(
        async (columnKeys: Array<keyof IndicatorViewModel>) => {
            if (!visibleIndicatorColumns) return;

            await compositionRoot.dataQuality.saveColumns(Namespaces.INDICATOR_STATUS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot, visibleIndicatorColumns]
    );

    const saveReorderedProgramIndicatorColumns = useCallback(
        async (columnKeys: Array<keyof ProgramIndicatorViewModel>) => {
            if (!visibleProgramIndicatorColumns) return;

            await compositionRoot.dataQuality.saveColumns(Namespaces.PROGRAM_INDICATOR_STATUS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot, visibleProgramIndicatorColumns]
    );

    const indicatorTableProps = useObjectsTable(indicatorBaseConfig, getIndicatorRows);
    const programIndicatorTableProps = useObjectsTable(programIndicatorBaseConfig, getProgramIndicatorRows);

    const indicatorColumnsToShow = useMemo<TableColumn<IndicatorViewModel>[]>(() => {
        if (!visibleIndicatorColumns || _.isEmpty(visibleIndicatorColumns)) return indicatorTableProps.columns;

        const indexes = _(visibleIndicatorColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(indicatorTableProps.columns)
            .map(column => ({ ...column, hidden: !visibleIndicatorColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [indicatorTableProps.columns, visibleIndicatorColumns]);

    const programIndicatorColumnsToShow = useMemo<TableColumn<ProgramIndicatorViewModel>[]>(() => {
        if (!visibleProgramIndicatorColumns || _.isEmpty(visibleProgramIndicatorColumns))
            return programIndicatorTableProps.columns;

        const indexes = _(visibleProgramIndicatorColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(programIndicatorTableProps.columns)
            .map(column => ({ ...column, hidden: !visibleProgramIndicatorColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [programIndicatorTableProps.columns, visibleProgramIndicatorColumns]);

    return (
        <React.Fragment>
            <Button
                color="primary"
                variant="contained"
                onClick={async () => {
                    openReloadModal();
                }}
            >
                {i18n.t("Reload Validation")}
            </Button>

            <ReloadWarningModal isOpen={isReloadModal} onSave={confirmReload} onCancel={closeReloadModal} />

            <Typography variant="h6" gutterBottom>
                {i18n.t("Indicators")}
            </Typography>

            <ObjectsList<IndicatorViewModel>
                {...indicatorTableProps}
                columns={indicatorColumnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedIndicatorColumns}
                isLoading={isLoading || isReloading}
            />

            <Typography variant="h6" gutterBottom>
                {i18n.t("Program Indicators")}
            </Typography>

            <ObjectsList<ProgramIndicatorViewModel>
                {...programIndicatorTableProps}
                columns={programIndicatorColumnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedProgramIndicatorColumns}
                isLoading={isLoading || isReloading}
            />
        </React.Fragment>
    );
});

export function getIndicatorSortingFromTableSorting(sorting: TableSorting<IndicatorViewModel>): Sorting<IndicatorItem> {
    return {
        field: sorting.field === "id" ? "name" : sorting.field,
        direction: sorting.order,
    };
}

export function getProgramIndicatorSortingFromTableSorting(
    sorting: TableSorting<ProgramIndicatorViewModel>
): Sorting<ProgramIndicatorItem> {
    return {
        field: sorting.field === "id" ? "name" : sorting.field,
        direction: sorting.order,
    };
}
