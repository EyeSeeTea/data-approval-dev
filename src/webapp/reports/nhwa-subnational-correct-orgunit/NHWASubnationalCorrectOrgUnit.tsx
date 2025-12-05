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
import DoneIcon from "@material-ui/icons/Done";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { useReload } from "../../utils/use-reload";
import { SubnationalCorrect } from "../../../domain/reports/nhwa-subnational-correct-orgunit/entities/SubnationalCorrect";

const defaultSortField = "orgUnitParent";

export const NHWASubnationalCorrectOrgUnit: React.FC = () => {
    const { compositionRoot, config } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const [reloadKey, reload] = useReload();
    const classes = useStyles();

    const updateSelectedRows = React.useCallback(
        async (ids: string[]) => {
            loading.show(true, i18n.t("Updating values..."));
            const results = await compositionRoot.nhwa.getSubnationalCorrectValues.execute({
                cacheKey: reloadKey,
                config,
                page: 1,
                pageSize: 1e6,
                sortingField: defaultSortField,
                sortingOrder: "asc",
                filters: {
                    orgUnits: [],
                    periods: [],
                },
            });
            const onlyRowsSelected = ids.length > 0 ? results.rows.filter(row => ids.includes(row.id)) : results.rows;
            if (results.rows.length > 0) {
                compositionRoot.nhwa.dismissSubnationalCorrectValues
                    .execute(onlyRowsSelected)
                    .then(stats => {
                        const statsWithoutErrorMessages = _(stats).omit("errorMessages").value();
                        snackbar.openSnackbar("success", JSON.stringify(statsWithoutErrorMessages, null, 4), {
                            autoHideDuration: 5000,
                        });
                        reload();
                        loading.hide();
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
        [compositionRoot, loading, snackbar, reload, reloadKey, config]
    );

    const baseConfig: TableConfig<SubnationalCorrect> = React.useMemo(
        () => ({
            columns: [
                {
                    name: "orgUnitParent",
                    text: i18n.t("Organisation Unit Parent"),
                    sortable: true,
                    getValue: row => row.orgUnitParent.name,
                },
                { name: "period", text: i18n.t("Period"), sortable: true },
                {
                    name: "orgUnit",
                    text: i18n.t("Organisation Unit"),
                    sortable: true,
                    getValue: row => row.orgUnit.name,
                },
                {
                    name: "nameToFix",
                    text: i18n.t("Name To Fix"),
                    sortable: true,
                },
            ],
            actions: [
                {
                    multiple: true,
                    name: "Dismiss",
                    icon: <DoneIcon />,
                    text: i18n.t("Dismiss"),
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
        }),
        [updateSelectedRows]
    );

    const getRows = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<SubnationalCorrect>) => {
            return compositionRoot.nhwa.getSubnationalCorrectValues
                .execute({
                    config,
                    cacheKey: reloadKey,
                    page: paging.page,
                    pageSize: paging.pageSize,
                    sortingField: sorting.field,
                    sortingOrder: sorting.order,
                    filters: {
                        orgUnits: [],
                        periods: [],
                    },
                })
                .then(results => {
                    return { pager: { ...results }, objects: results.rows };
                })
                .catch(error => {
                    snackbar.error(error);
                    return {
                        pager: { page: 0, pageCount: 0, total: 0, pageSize: 0 },
                        objects: [],
                    };
                });
        },
        [compositionRoot, reloadKey, config, snackbar]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Module 1 (subnational) with fixes for organisation unit name")}
            </Typography>

            <ObjectsList<SubnationalCorrect> {...tableProps} onChangeSearch={undefined} />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
