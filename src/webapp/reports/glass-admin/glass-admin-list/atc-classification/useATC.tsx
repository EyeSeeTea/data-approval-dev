import { useAppContext } from "../../../../contexts/app-context";
import { useReload } from "../../../../utils/use-reload";
import { ATCState } from "./ATCState";
import { useATCListColumns } from "./useATCListColumns";
import { useGetATCs } from "./useGetATCs";

const pagination = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

const initialSorting = {
    field: "year" as const,
    order: "desc" as const,
};

export function useATC(): ATCState {
    const { compositionRoot } = useAppContext();
    const [reloadKey, reload] = useReload();

    const { uploadedYears, getATCs } = useGetATCs(compositionRoot, reloadKey);
    const { visibleColumns, saveReorderedColumns } = useATCListColumns(compositionRoot);

    return {
        initialSorting,
        pagination,
        uploadedYears,
        visibleColumns,
        getATCs,
        reload,
        saveReorderedColumns,
    };
}
