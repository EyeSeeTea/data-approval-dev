import { useCallback, useState } from "react";
import { TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import { Sorting } from "../../../../../domain/common/entities/PaginatedObjects";
import { ATCViewModel, getATCViewModel } from "../../DataMaintenanceViewModel";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { ATCItem } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { CompositionRoot } from "../../../../../compositionRoot";

export function useGetATCs(compositionRoot: CompositionRoot, reloadKey: string) {
    const [uploadedYears, setUploadedYears] = useState<string[]>([]);

    const getATCs = useCallback(
        async (_search: string, paging: TablePagination, sorting: TableSorting<ATCViewModel>) => {
            const { objects, pager, uploadedYears } = await compositionRoot.glassAdmin.getATCs(
                {
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                },
                Namespaces.ATCS
            );

            setUploadedYears(uploadedYears);
            console.debug("Reloading", reloadKey);

            return { objects: getATCViewModel(objects), pager: pager };
        },
        [compositionRoot.glassAdmin, reloadKey]
    );

    return { uploadedYears, getATCs };
}

function getSortingFromTableSorting(sorting: TableSorting<ATCViewModel>): Sorting<ATCItem> {
    return {
        field: sorting.field === "id" ? "year" : sorting.field,
        direction: sorting.order,
    };
}
