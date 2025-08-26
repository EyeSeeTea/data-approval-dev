import { useAppContext } from "../../../contexts/app-context";
import useListColumns from "./useListColumns";
import { Filter } from "./Filters";
import { useGetDataSubmissions } from "./useGetDataSubmissions";
import { useGetUserPermissions } from "./useGetUserPermissions";
import { useMemo } from "react";
import _ from "lodash";

const initialSorting = {
    field: "orgUnitName" as const,
    order: "asc" as const,
};
const pagination = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

export function useDataSubmissionList(filters: Filter) {
    const { compositionRoot, config } = useAppContext();

    const { isEARModule, isEGASPUser, userModules } = useGetUserPermissions(compositionRoot, config, filters);
    const { visibleColumns, visibleEARColumns, saveReorderedColumns, saveReorderedEARColumns } = useListColumns(
        compositionRoot,
        isEARModule
    );
    const { dataSubmissionPeriod, selectablePeriods, getEARRows, getRows, reload } = useGetDataSubmissions(
        compositionRoot,
        config,
        filters
    );

    const moduleQuestionnaires = useMemo(() => {
        return _.compact(
            userModules
                .find(userModule => userModule.id === filters.module)
                ?.questionnaires.map(questionnaire => questionnaire.id)
        );
    }, [filters.module, userModules]);

    return {
        dataSubmissionPeriod,
        initialSorting,
        isEARModule,
        isEGASPUser,
        pagination,
        moduleQuestionnaires,
        selectablePeriods,
        userModules,
        visibleColumns,
        visibleEARColumns,
        getEARRows,
        getRows,
        reload,
        saveReorderedColumns,
        saveReorderedEARColumns,
    };
}
