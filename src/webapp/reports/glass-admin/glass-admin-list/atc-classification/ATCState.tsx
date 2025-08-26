import { TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import { ATCViewModel } from "../../DataMaintenanceViewModel";
import { PaginatedObjects } from "../../../../../domain/common/entities/PaginatedObjects";

export interface ATCState {
    getATCs(
        _search: string,
        paging: TablePagination,
        sorting: TableSorting<ATCViewModel>
    ): Promise<PaginatedObjects<ATCViewModel>>;
    initialSorting: TableSorting<ATCViewModel>;
    pagination: {
        pageSizeOptions: number[];
        pageSizeInitialValue: number;
    };
    uploadedYears: string[];
    visibleColumns: string[] | undefined;
    reload(): void;
    saveReorderedColumns: (columnKeys: Array<keyof ATCViewModel>) => Promise<void>;
}
