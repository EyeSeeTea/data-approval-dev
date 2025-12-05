import { FilesState } from "./FilesState";
import { useAppContext } from "../../../../contexts/app-context";
import { useReload } from "../../../../utils/use-reload";
import { Filter } from "./Filter";
import { useGetFiles } from "./useGetFiles";
import { useDeleteFiles } from "./useDeleteFiles";
import { useAMCListColumns } from "./useAMCListColumns";

const pagination = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

const initialSorting = {
    field: "fileName" as const,
    order: "asc" as const,
};

export function useFiles(filters: Filter): FilesState {
    const { compositionRoot } = useAppContext();
    const [reloadKey, reload] = useReload();

    const { filesToDelete, getFiles } = useGetFiles(compositionRoot, filters, reloadKey);
    const { deleteFiles, isDeleteModalOpen } = useDeleteFiles(compositionRoot, reload);
    const { visibleColumns, saveReorderedColumns } = useAMCListColumns(compositionRoot);

    return {
        getFiles,
        pagination,
        initialSorting,
        isDeleteModalOpen,
        filesToDelete,
        deleteFiles,
        visibleColumns,
        saveReorderedColumns,
    };
}
