import { useCallback, useEffect, useState } from "react";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { ATCViewModel } from "../../DataMaintenanceViewModel";
import { CompositionRoot } from "../../../../../compositionRoot";

interface UseATCColumnsState {
    visibleColumns: string[] | undefined;
    saveReorderedColumns: (columnKeys: Array<keyof ATCViewModel>) => Promise<void>;
}

export function useATCListColumns(compositionRoot: CompositionRoot): UseATCColumnsState {
    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    useEffect(() => {
        compositionRoot.glassAdmin.getColumns(Namespaces.ATC_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.glassAdmin]);

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof ATCViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassAdmin.saveColumns(Namespaces.ATC_USER_COLUMNS, columnKeys);
        },
        [compositionRoot.glassAdmin, visibleColumns]
    );

    return { visibleColumns, saveReorderedColumns };
}
