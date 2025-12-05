import _ from "lodash";
import React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import {
    ObjectsList,
    TableConfig,
    TablePagination,
    TableSorting,
    useLoading,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import DoneIcon from "@material-ui/icons/Done";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { getOrgUnitIdsFromPaths, getRootIds, OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { DataElement } from "../../../domain/common/entities/DataSet";
import { countryLevel } from "../common/nhwa-settings";
import { useReload } from "../../utils/use-reload";
import { Filters } from "../common/Filters";
import { AlertStatsErrors } from "../../components/alert-stats-errors/AlertStatsErrors";
import { Stats } from "../../../domain/common/entities/Stats";

export type FixTotalsWithPaging = {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    rows: FixTotalsViewModel[];
};

export type FixTotalsViewModel = {
    id: string;
    dataElement: Pick<DataElement, "id" | "name">;
    orgUnit: Pick<OrgUnit, "id" | "name">;
    period: string;
    total: string;
    practising: string;
    professionallyActive: string;
    licensedToPractice: string;
    correctTotal: string;
    comment: string;
};

function showHyphenForEmptyValue(value: string) {
    return value || " - ";
}

const defaultSortField = "orgUnit";

export function useGetTotalsByActivityLevel(props: { orgsUnitsIds: string[]; periods: string[]; reloadKey: string }) {
    const { orgsUnitsIds, periods, reloadKey } = props;
    const { compositionRoot } = useAppContext();
    const [tableFilters, setTableFilters] = React.useState<{
        paging: TablePagination;
        sorting: TableSorting<FixTotalsViewModel>;
    }>({ paging: { page: 1, pageSize: 10, total: 0 }, sorting: { field: defaultSortField, order: "asc" } });
    const [isLoading, setIsLoading] = React.useState(false);
    const [rows, setRows] = React.useState<{
        pager: {
            page: number;
            pageCount: number;
            total: number;
            pageSize: number;
        };
        objects: FixTotalsViewModel[];
    }>();

    React.useEffect(() => {
        let didCancel = false;

        async function getTableRecords() {
            setIsLoading(true);
            const { paging, sorting } = tableFilters;
            const results = await compositionRoot.nhwa.getTotalsByActivityLevel.execute({
                page: paging.page,
                pageSize: paging.pageSize,
                sortingField: sorting.field,
                sortingOrder: sorting.order,
                filters: { orgUnits: getOrgUnitIdsFromPaths(orgsUnitsIds), periods: periods },
            });

            if (!didCancel) {
                setRows({
                    pager: {
                        page: results.page,
                        pageCount: results.pageCount,
                        total: results.total,
                        pageSize: results.pageSize,
                    },
                    objects: results.rows,
                });
                setIsLoading(false);
            }
        }

        getTableRecords();

        return () => {
            didCancel = true;
        };
    }, [compositionRoot.nhwa.getTotalsByActivityLevel, orgsUnitsIds, periods, tableFilters, reloadKey]);

    return { rows, isLoading, tableFilters, setTableFilters };
}

export const NHWAFixTotals: React.FC = () => {
    const { compositionRoot, api, config } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const [reloadKey, reload] = useReload();
    const [selectedPeriods, setSelectedPeriods] = React.useState<string[]>([]);
    const [selectedOrgUnits, setSelectedOrgUnits] = React.useState<string[]>([]);
    const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
    const [errors, setErrors] = React.useState<Stats["errorMessages"]>();
    const classes = useStyles();

    const { isLoading, rows, setTableFilters } = useGetTotalsByActivityLevel({
        orgsUnitsIds: selectedOrgUnits,
        periods: selectedPeriods,
        reloadKey,
    });

    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    React.useEffect(() => {
        async function loadOrgUnits() {
            const orgUnits = await compositionRoot.orgUnits.getByLevel(String(countryLevel));
            setOrgUnits(orgUnits);
        }
        loadOrgUnits();
    }, [compositionRoot.orgUnits]);

    const updateSelectedRows = React.useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Updating values..."));
            const results = await compositionRoot.nhwa.getTotalsByActivityLevel.execute({
                page: 1,
                pageSize: 1e6,
                sortingField: defaultSortField,
                sortingOrder: "asc",
                filters: {
                    orgUnits: getOrgUnitIdsFromPaths(selectedOrgUnits),
                    periods: selectedPeriods,
                },
            });
            const onlyRowsSelected = ids.length > 0 ? results.rows.filter(row => ids.includes(row.id)) : results.rows;
            if (results.rows.length > 0) {
                compositionRoot.nhwa.fixTotalValues
                    .execute(onlyRowsSelected)
                    .then(stats => {
                        const statsWithoutErrorMessages = _(stats).omit("errorMessages").value();
                        snackbar.openSnackbar("success", JSON.stringify(statsWithoutErrorMessages, null, 4), {
                            autoHideDuration: 20 * 1000,
                        });
                        reload();
                        loading.hide();
                        if (stats.errorMessages.length > 0) {
                            setErrors(stats.errorMessages);
                        }
                    })
                    .catch(err => {
                        snackbar.error(err.message);
                        loading.hide();
                    });
            } else {
                snackbar.info(i18n.t("No values to update"));
                loading.hide();
            }
        },
        [compositionRoot, loading, snackbar, reload, selectedOrgUnits, selectedPeriods]
    );

    const baseConfig: TableConfig<FixTotalsViewModel> = React.useMemo(
        () => ({
            columns: [
                {
                    name: "orgUnit",
                    text: i18n.t("Organisation Unit"),
                    sortable: true,
                    getValue: row => row.orgUnit.name,
                },
                { name: "period", text: i18n.t("Period"), sortable: true },
                {
                    name: "dataElement",
                    text: i18n.t("Occupation"),
                    sortable: true,
                    getValue: row => row.dataElement.name,
                },
                {
                    name: "total",
                    text: i18n.t("Total"),
                    sortable: true,
                    getValue: row => showHyphenForEmptyValue(row.total),
                },
                {
                    name: "practising",
                    text: i18n.t("Practising"),
                    sortable: true,
                    getValue: row => showHyphenForEmptyValue(row.practising),
                },
                {
                    name: "professionallyActive",
                    text: i18n.t("Professionally Active"),
                    sortable: true,
                    getValue: row => showHyphenForEmptyValue(row.professionallyActive),
                },
                {
                    name: "licensedToPractice",
                    text: i18n.t("Licensed To Practice"),
                    sortable: true,
                    getValue: row => showHyphenForEmptyValue(row.licensedToPractice),
                },
                { name: "correctTotal", text: i18n.t("Correct total"), sortable: true },
                { name: "comment", text: i18n.t("Comment to Assign"), sortable: true },
            ],
            actions: [
                {
                    multiple: true,
                    name: "Fix Total",
                    icon: <DoneIcon />,
                    text: i18n.t("Fix Total"),
                    onClick: async ids => {
                        if (ids.length === 0) return undefined;
                        updateSelectedRows(ids);
                    },
                },
            ],
            initialSorting: {
                field: defaultSortField,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
            loading: false,
            globalActions: [
                {
                    name: "Fix Incorrect Totals",
                    icon: <DoneAllIcon />,
                    text: i18n.t("Fix Incorrect Totals"),
                    onClick: () => {
                        updateSelectedRows([]);
                    },
                },
            ],
        }),
        [updateSelectedRows]
    );

    const getRows = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<FixTotalsViewModel>) => {
            setTableFilters({ paging, sorting });
            return Promise.resolve({ pager: { page: 1, pageCount: 1, total: 0, pageSize: 10 }, objects: [] });
        },
        [setTableFilters]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Module 1 totals by Activity Label with missing value that does not match the auto-calculated")}
            </Typography>

            <AlertStatsErrors errors={errors} onCleanError={() => setErrors(undefined)} orgUnits={orgUnits} />

            <ObjectsList<FixTotalsViewModel>
                {...tableProps}
                pagination={{
                    page: rows?.pager.page || 1,
                    total: rows?.pager.total || 0,
                    pageSize: rows?.pager.pageSize || 10,
                }}
                rows={rows?.objects || []}
                onChangeSearch={undefined}
                loading={isLoading}
            >
                <Filters
                    api={api}
                    rootIds={rootIds}
                    orgUnits={orgUnits}
                    selectedOrgUnits={selectedOrgUnits}
                    setSelectedOrgUnits={setSelectedOrgUnits}
                    selectedPeriod={selectedPeriods}
                    setSelectedPeriods={setSelectedPeriods}
                />
            </ObjectsList>
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
