import { TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import { GLASSDataMaintenanceItem } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { DataMaintenanceViewModel } from "../../DataMaintenanceViewModel";
import { PaginatedObjects } from "../../../../../domain/common/entities/PaginatedObjects";

export interface FilesState {
    getFiles: (
        _search: string,
        paging: TablePagination,
        sorting: TableSorting<DataMaintenanceViewModel>
    ) => Promise<PaginatedObjects<GLASSDataMaintenanceItem>>;
    pagination: {
        pageSizeOptions: number[];
        pageSizeInitialValue: number;
    };
    initialSorting: TableSorting<DataMaintenanceViewModel>;
    isDeleteModalOpen: boolean;
    filesToDelete: string[];
    deleteFiles(ids: string[]): void;
    visibleColumns: string[] | undefined;
    saveReorderedColumns: (columnKeys: Array<keyof DataMaintenanceViewModel>) => Promise<void>;
}
