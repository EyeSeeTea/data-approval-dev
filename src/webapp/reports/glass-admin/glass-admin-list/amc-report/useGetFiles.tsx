import { useCallback, useState } from "react";
import { TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import { PaginatedObjects, Sorting } from "../../../../../domain/common/entities/PaginatedObjects";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { Filter } from "./Filter";
import { DataMaintenanceViewModel } from "../../DataMaintenanceViewModel";
import { GLASSDataMaintenanceItem } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { CompositionRoot } from "../../../../../compositionRoot";

interface GetFilesState {
    getFiles: (
        _search: string,
        paging: TablePagination,
        sorting: TableSorting<DataMaintenanceViewModel>
    ) => Promise<PaginatedObjects<GLASSDataMaintenanceItem>>;
    filesToDelete: string[];
}

export function useGetFiles(compositionRoot: CompositionRoot, filters: Filter, reloadKey: string): GetFilesState {
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    const getFiles = useCallback(
        async (_search: string, paging: TablePagination, sorting: TableSorting<DataMaintenanceViewModel>) => {
            const { objects, pager, rowIds } = await compositionRoot.glassAdmin.get(
                {
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    module: filters.module,
                },
                Namespaces.FILE_UPLOADS
            );

            setFilesToDelete(rowIds);
            console.debug("Reloading", reloadKey);

            return { objects, pager };
        },
        [compositionRoot.glassAdmin, filters.module, reloadKey]
    );

    return { filesToDelete, getFiles };
}

function getSortingFromTableSorting(
    sorting: TableSorting<DataMaintenanceViewModel>
): Sorting<GLASSDataMaintenanceItem> {
    return {
        field: sorting.field === "id" ? "fileName" : sorting.field,
        direction: sorting.order,
    };
}
