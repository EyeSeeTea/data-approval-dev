import { useCallback, useEffect, useState } from "react";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { DataMaintenanceViewModel } from "../../DataMaintenanceViewModel";
import { CompositionRoot } from "../../../../../compositionRoot";

interface UseAMCColumnsState {
    visibleColumns: string[] | undefined;
    saveReorderedColumns: (columnKeys: Array<keyof DataMaintenanceViewModel>) => Promise<void>;
}

export function useAMCListColumns(compositionRoot: CompositionRoot): UseAMCColumnsState {
    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    useEffect(() => {
        compositionRoot.glassAdmin.getColumns(Namespaces.FILE_UPLOADS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.glassAdmin]);

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataMaintenanceViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassAdmin.saveColumns(Namespaces.FILE_UPLOADS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot.glassAdmin, visibleColumns]
    );

    return { visibleColumns, saveReorderedColumns };
}
