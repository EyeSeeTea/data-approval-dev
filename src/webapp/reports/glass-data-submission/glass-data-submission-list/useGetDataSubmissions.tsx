import { useMemo, useState } from "react";
import { CompositionRoot } from "../../../../compositionRoot";
import { TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import {
    DataSubmissionViewModel,
    EARDataSubmissionViewModel,
    getDataSubmissionViews,
    getEARDataSubmissionViews,
} from "../DataSubmissionViewModel";
import { Config } from "../../../../domain/common/entities/Config";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    DataSubmissionPeriod,
    EARDataSubmissionItem,
    GLASSDataSubmissionItem,
} from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { useReload } from "../../../utils/use-reload";
import { Filter } from "./Filters";
import _ from "lodash";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { useSelectablePeriods } from "../../../hooks/useSelectablePeriods";

export function useGetDataSubmissions(compositionRoot: CompositionRoot, config: Config, filters: Filter) {
    const [reloadKey, reload] = useReload();
    const [dataSubmissionPeriod, setDataSubmissionPeriod] = useState<DataSubmissionPeriod>("YEARLY");

    const selectablePeriods = useSelectablePeriods(startYear);

    const getUseCaseOptions = useMemo(
        () => (filter: Filter, selectablePeriods: string[]) => {
            return {
                ...filter,
                dataSubmissionPeriod,
                periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
                quarters: _.isEmpty(filter.quarters) ? ["Q1", "Q2", "Q3", "Q4"] : filter.quarters,
                orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
            };
        },
        [dataSubmissionPeriod]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubmissionViewModel>) => {
            const { pager, objects } = await compositionRoot.glassDataSubmission.get(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    ...getUseCaseOptions(filters, selectablePeriods),
                },
                Namespaces.DATA_SUBMISSSIONS
            );

            console.debug("Reloading", reloadKey);

            setDataSubmissionPeriod(_.first(objects)?.dataSubmissionPeriod ?? "YEARLY");

            return { pager, objects: getDataSubmissionViews(config, objects) };
        },
        [compositionRoot.glassDataSubmission, config, filters, getUseCaseOptions, reloadKey, selectablePeriods]
    );

    const getEARRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<EARDataSubmissionViewModel>) => {
            const { pager, objects } = await compositionRoot.glassDataSubmission.getEAR(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getEARSortingFromTableSorting(sorting),
                    ...getUseCaseOptions(filters, selectablePeriods),
                },
                Namespaces.SIGNALS
            );
            console.debug("Reloading", reloadKey);

            return { pager, objects: getEARDataSubmissionViews(config, objects) };
        },
        [compositionRoot.glassDataSubmission, config, filters, getUseCaseOptions, reloadKey, selectablePeriods]
    );

    return {
        dataSubmissionPeriod,
        selectablePeriods,
        getEARRows,
        getRows,
        reload,
    };
}

function getSortingFromTableSorting(sorting: TableSorting<DataSubmissionViewModel>): Sorting<GLASSDataSubmissionItem> {
    return {
        field: sorting.field === "id" ? "orgUnitName" : sorting.field,
        direction: sorting.order,
    };
}

function getEARSortingFromTableSorting(
    sorting: TableSorting<EARDataSubmissionViewModel>
): Sorting<EARDataSubmissionItem> {
    return {
        field: sorting.field === "id" ? "orgUnitName" : sorting.field,
        direction: sorting.order,
    };
}

const startYear = 2016;
