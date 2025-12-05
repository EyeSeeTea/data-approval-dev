import { useCallback, useEffect, useState } from "react";
import { CompositionRoot } from "../../../../compositionRoot";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { DataSubmissionViewModel, EARDataSubmissionViewModel } from "../DataSubmissionViewModel";

export default function useListColumns(compositionRoot: CompositionRoot, isEARModule: boolean) {
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [visibleEARColumns, setVisibleEARColumns] = useState<string[]>();

    useEffect(() => {
        if (isEARModule) {
            compositionRoot.glassDataSubmission.getColumns(Namespaces.SIGNALS_USER_COLUMNS).then(columns => {
                setVisibleEARColumns(columns);
            });
        } else {
            compositionRoot.glassDataSubmission.getColumns(Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS).then(columns => {
                setVisibleColumns(columns);
            });
        }
    }, [compositionRoot, isEARModule]);

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataSubmissionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassDataSubmission.saveColumns(
                Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const saveReorderedEARColumns = useCallback(
        async (columnKeys: Array<keyof EARDataSubmissionViewModel>) => {
            if (!visibleEARColumns) return;

            await compositionRoot.glassDataSubmission.saveColumns(Namespaces.SIGNALS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot, visibleEARColumns]
    );

    return {
        isEARModule,
        visibleColumns,
        visibleEARColumns,
        saveReorderedColumns,
        saveReorderedEARColumns,
    };
}
