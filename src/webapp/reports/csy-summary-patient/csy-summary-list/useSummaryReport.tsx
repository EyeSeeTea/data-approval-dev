import { TableGlobalAction, TablePagination, TableSorting, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Filter, FilterOptions } from "./Filters";
import { useMemo, useState } from "react";
import { useReload } from "../../../utils/use-reload";
import { useAppContext } from "../../../contexts/app-context";
import { SummaryItem } from "../../../../domain/reports/csy-summary-patient/entities/SummaryItem";
import { emptyPage, PaginatedObjects, Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { getSummaryViews, SummaryViewModel } from "../SummaryViewModel";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";

interface SummaryReportState {
    downloadCsv: TableGlobalAction;
    filterOptions: FilterOptions;
    getRows: (
        search: string,
        paging: TablePagination,
        sorting: TableSorting<SummaryViewModel>
    ) => Promise<PaginatedObjects<SummaryViewModel>>;
    initialSorting: TableSorting<SummaryViewModel>;
    paginationOptions: {
        pageSizeOptions: number[];
        pageSizeInitialValue: number;
    };
}

const initialSorting = {
    field: "group" as const,
    order: "asc" as const,
};

const paginationOptions = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

export function useSummaryReport(filters: Filter): SummaryReportState {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [reloadKey, _reload] = useReload();

    const [sorting, setSorting] = useState<TableSorting<SummaryViewModel>>();

    const selectablePeriods = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 10, currentYear + 1).map(n => n.toString());
    }, []);

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<SummaryViewModel>) => {
            const { pager, objects } = await compositionRoot.summary.get({
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            setSorting(sorting);
            console.debug("Reloading", reloadKey);
            return { pager, objects: getSummaryViews(objects) };
        },
        [compositionRoot.summary, filters, reloadKey]
    );

    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: summaryItems } = await compositionRoot.summary
                .get({
                    paging: { page: 1, pageSize: 100000 },
                    sorting: getSortingFromTableSorting(sorting),
                    ...filters,
                })
                .catch(error => {
                    snackbar.error(error.message);
                    return emptyPage;
                });

            compositionRoot.summary.save("summary-table-report.csv", summaryItems);
        },
    };

    return {
        downloadCsv,
        filterOptions,
        getRows,
        initialSorting,
        paginationOptions,
    };
}

function getSortingFromTableSorting(sorting: TableSorting<SummaryViewModel>): Sorting<SummaryItem> {
    return {
        field: sorting.field === "id" ? "group" : sorting.field,
        direction: sorting.order,
    };
}

function getFilterOptions(selectablePeriods: string[]) {
    return {
        periods: selectablePeriods,
    };
}
