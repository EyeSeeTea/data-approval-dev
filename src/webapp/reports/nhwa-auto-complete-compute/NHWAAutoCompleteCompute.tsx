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

import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { getOrgUnitIdsFromPaths, getRootIds, OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { CategoryOptionCombo, DataElement } from "../../../domain/common/entities/DataSet";
import { useReload } from "../../utils/use-reload";
import { Filters } from "../common/Filters";
import { Stats } from "../../../domain/common/entities/Stats";
import { AlertStatsErrors } from "../../components/alert-stats-errors/AlertStatsErrors";
import { useSettings } from "../../hooks/UseAutocompleteCompute";

export type NHWAAutoCompleteComputeProps = { countryLevel: string; settingsKey: string; title: string };

export type AutoCompleteComputeViewModelWithPaging = {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    rows: AutoCompleteComputeViewModel[];
};

export type AutoCompleteComputeViewModel = {
    id: string;
    dataElement: Pick<DataElement, "id" | "name">;
    orgUnit: Pick<OrgUnit, "id" | "name">;
    period: string;
    categoryOptionCombo: Pick<CategoryOptionCombo, "id" | "name">;
    correctValue: string;
    valueToFix: string;
    currentValue: string | undefined;
};

export const NHWAAutoCompleteCompute: React.FC<NHWAAutoCompleteComputeProps> = props => {
    const { countryLevel, settingsKey, title } = props;
    const { compositionRoot, api, config } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const [reloadKey, reload] = useReload();
    const [selectedPeriods, setSelectedPeriods] = React.useState<string[]>([]);
    const [selectedOrgUnits, setSelectedOrgUnits] = React.useState<string[]>([]);
    const [orgUnits, setOrgUnits] = React.useState<OrgUnit[]>([]);
    const [errors, setErrors] = React.useState<Stats["errorMessages"]>();
    const classes = useStyles();

    const { settings } = useSettings({ settingKey: settingsKey });

    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    React.useEffect(() => {
        async function loadOrgUnits() {
            const orgUnits = await compositionRoot.orgUnits.getByLevel(countryLevel);
            setOrgUnits(orgUnits);
        }
        loadOrgUnits();
    }, [compositionRoot.orgUnits, countryLevel]);

    const baseConfig: TableConfig<AutoCompleteComputeViewModel> = React.useMemo(
        () => ({
            columns: [
                {
                    name: "dataElement",
                    text: i18n.t("Data Element"),
                    sortable: true,
                    getValue: row => (row.dataElement ? row.dataElement.name : ""),
                },
                {
                    name: "categoryOptionCombo",
                    text: i18n.t("Category Option Combo"),
                    sortable: true,
                    getValue: row => (row.categoryOptionCombo ? row.categoryOptionCombo.name : ""),
                },
                {
                    name: "orgUnit",
                    text: i18n.t("Organisation Unit"),
                    sortable: true,
                    getValue: row => (row.orgUnit ? row.orgUnit.name : ""),
                },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "correctValue", text: i18n.t("Correct Value"), sortable: true },
                {
                    name: "currentValue",
                    text: i18n.t("Current value"),
                    sortable: true,
                    getValue: row => row.currentValue || "Empty",
                },
            ],
            actions: [],
            initialSorting: {
                field: "dataElement" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
            globalActions: [
                {
                    name: "Fix Everything",
                    icon: <DoneAllIcon />,
                    text: i18n.t("Fix all incorrect values"),
                    onClick: async ids => {
                        if (ids.length === 0 || !settings) return;
                        loading.show(true, i18n.t("Updating values..."));
                        const results = await compositionRoot.nhwa.getAutoCompleteComputeValues.execute({
                            settings: settings,
                            cacheKey: reloadKey,
                            page: 1,
                            pageSize: 1e6,
                            sortingField: "dataElement",
                            sortingOrder: "asc",
                            filters: {
                                orgUnits: getOrgUnitIdsFromPaths(selectedOrgUnits),
                                periods: selectedPeriods,
                            },
                        });

                        compositionRoot.nhwa.fixAutoCompleteComputeValues
                            .execute(results.rows)
                            .then(stats => {
                                loading.hide();
                                reload();
                                const statsWithoutErrorMessages = _(stats).omit("errorMessages").value();
                                snackbar.openSnackbar("success", JSON.stringify(statsWithoutErrorMessages, null, 4), {
                                    autoHideDuration: 20 * 10000,
                                });
                                if (stats.errorMessages.length > 0) {
                                    setErrors(stats.errorMessages);
                                }
                            })
                            .catch(err => {
                                snackbar.error(err);
                                loading.hide();
                            });
                    },
                },
            ],
        }),
        [compositionRoot, loading, snackbar, reload, reloadKey, selectedOrgUnits, selectedPeriods, settings]
    );

    const getRows = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<AutoCompleteComputeViewModel>) => {
            if (!settings) return { objects: [], pager: { page: 0, pageCount: 0, pageSize: 10, rows: [], total: 0 } };
            loading.show(true, i18n.t("Loading..."));
            const results = await compositionRoot.nhwa.getAutoCompleteComputeValues.execute({
                settings: settings,
                cacheKey: reloadKey,
                page: paging.page,
                pageSize: paging.pageSize,
                sortingField: sorting.field,
                sortingOrder: sorting.order,
                filters: {
                    orgUnits: getOrgUnitIdsFromPaths(selectedOrgUnits),
                    periods: selectedPeriods,
                },
            });
            loading.hide();
            return { pager: { ...results }, objects: results.rows };
        },
        [compositionRoot, reloadKey, selectedOrgUnits, selectedPeriods, loading, settings]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>

            <AlertStatsErrors errors={errors} onCleanError={() => setErrors(undefined)} orgUnits={orgUnits} />

            <ObjectsList<AutoCompleteComputeViewModel> {...tableProps} onChangeSearch={undefined}>
                <Filters
                    api={api}
                    rootIds={rootIds}
                    orgUnits={orgUnits}
                    selectedOrgUnits={selectedOrgUnits}
                    setSelectedOrgUnits={orgUnits => {
                        setSelectedOrgUnits(orgUnits);
                        reload();
                    }}
                    selectedPeriod={selectedPeriods}
                    setSelectedPeriods={periods => {
                        setSelectedPeriods(periods);
                        reload();
                    }}
                />
            </ObjectsList>
        </div>
    );
};

const useStyles = makeStyles({ wrapper: { padding: 20 } });
