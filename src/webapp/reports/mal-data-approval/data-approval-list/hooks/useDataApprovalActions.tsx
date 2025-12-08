import _ from "lodash";
import { useCallback, useState } from "react";
import i18n from "../../../../../locales";
import { parseDataDuplicationItemId } from "../../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { useReload } from "../../../../utils/use-reload";
import { useAppContext } from "../../../../contexts/app-context";
import { useDataApprovalMonitoring } from "./useDataApprovalMonitoring";
import { useBooleanState } from "../../../../utils/use-boolean";
import { useLoading } from "@eyeseetea/d2-ui-components";
import { DataSetWithConfigPermissions } from "../../../../../domain/usecases/GetApprovalConfigurationsUseCase";

type GlobalMessage = {
    type: "success" | "error";
    message: string;
};

type ModalActions = {
    isDialogOpen: boolean;
    revoke: boolean;
    closeDataDifferencesDialog: () => void;
};

type CompletionStatus = "complete" | "incomplete";

type DataApprovalActionsState = {
    globalMessage: GlobalMessage | undefined;
    reloadKey: string;
    selectedIds: string[];
    modalActions: ModalActions;
    onTableActionClick: {
        activateMonitoringAction: (selectedIds: string[]) => Promise<void>;
        approveAction: (selectedIds: string[]) => Promise<void>;
        completeAction: (selectedIds: string[]) => Promise<void>;
        deactivateMonitoringAction: (selectedIds: string[]) => Promise<void>;
        getDifferenceAction: (selectedIds: string[]) => Promise<void>;
        getDifferenceAndRevokeAction: (selectedIds: string[]) => Promise<void>;
        incompleteAction: (selectedIds: string[]) => Promise<void>;
        revokeAction: (selectedIds: string[]) => Promise<void>;
        submitAction: (selectedIds: string[]) => Promise<void>;
    };
};

export function useDataApprovalActions(props: {
    dataSetsConfig: DataSetWithConfigPermissions[];
}): DataApprovalActionsState {
    const { dataSetsConfig } = props;
    const { compositionRoot } = useAppContext();
    const [reloadKey, reload] = useReload();
    const loading = useLoading();
    const log = useCallback((msg: string) => loading.updateMessage(msg), [loading]);
    const { saveMonitoring: saveMonitoringValue } = useDataApprovalMonitoring();

    const [globalMessage, setGlobalMessage] = useState<GlobalMessage>();
    const [selectedIds, setSelectedIds] = useState<string[]>([""]);
    const [revoke, { enable: enableRevoke, disable: disableRevoke }] = useBooleanState(false);
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    const activateMonitoringAction = useCallback(
        async (selectedIds: string[]) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;

            saveMonitoringValue(items, true);
            reload();
        },
        [reload, saveMonitoringValue]
    );

    const approveAction = useCallback(
        async (selectedIds: string[]) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;

            loading.show(true, "Approving dataset");
            const result = await compositionRoot.malDataApproval.updateStatus({
                items,
                action: "duplicate",
                dataSetsConfig,
            });
            if (!result) setGlobalMessage({ type: "error", message: i18n.t("Error when trying to approve data set") });

            reload();
            loading.hide();
        },
        [compositionRoot.malDataApproval, reload, loading, dataSetsConfig]
    );

    const updateCompletionStatus = useCallback(
        async (selectedIds: string[], status: CompletionStatus, loadingText: string) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;
            loading.show(true, loadingText);
            const result = await compositionRoot.malDataApproval.updateStatus({
                items,
                action: status,
                dataSetsConfig,
            });
            if (!result)
                setGlobalMessage({ type: "error", message: i18n.t(`Error when trying to ${status} data set`) });

            reload();
            loading.hide();
        },
        [compositionRoot.malDataApproval, reload, loading, dataSetsConfig]
    );

    const completeAction = useCallback(
        async (selectedIds: string[]) => updateCompletionStatus(selectedIds, "complete", i18n.t("Completing dataset")),
        [updateCompletionStatus]
    );

    const deactivateMonitoringAction = useCallback(
        async (selectedIds: string[]) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;

            saveMonitoringValue(items, false);
            reload();
        },
        [reload, saveMonitoringValue]
    );

    const getDifferenceAction = useCallback(
        async (selectedIds: string[]) => {
            disableRevoke();
            openDialog();
            setSelectedIds(selectedIds);
        },
        [disableRevoke, openDialog, setSelectedIds]
    );

    const getDifferenceAndRevokeAction = useCallback(
        async (selectedIds: string[]) => {
            enableRevoke();
            openDialog();
            setSelectedIds(selectedIds);
        },
        [enableRevoke, openDialog, setSelectedIds]
    );

    const incompleteAction = useCallback(
        async (selectedIds: string[]) =>
            updateCompletionStatus(selectedIds, "incomplete", i18n.t("Updating status to incomplete")),
        [updateCompletionStatus]
    );

    const revokeAction = useCallback(
        async (selectedIds: string[]) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;
            loading.show(true, i18n.t("Revoking dataset"));
            const result = await compositionRoot.malDataApproval.updateStatus({
                items,
                action: "revoke",
                dataSetsConfig,
            });
            if (!result) setGlobalMessage({ type: "error", message: i18n.t("Error when trying to unsubmit data set") });

            reload();
            loading.hide();
        },
        [compositionRoot.malDataApproval, reload, loading, dataSetsConfig]
    );

    const submitAction = useCallback(
        async (selectedIds: string[]) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;
            loading.show(true, "Loading...");
            const result = await compositionRoot.malDataApproval.updateStatus({
                items,
                action: "approve",
                log,
                dataSetsConfig,
            });
            if (!result) setGlobalMessage({ type: "error", message: i18n.t("Error when trying to submit data set") });

            reload();
            loading.hide();
        },
        [compositionRoot.malDataApproval, reload, loading, log, dataSetsConfig]
    );

    const closeDataDifferencesDialog = useCallback(() => {
        closeDialog();
        disableRevoke();
        reload();
    }, [closeDialog, disableRevoke, reload]);

    return {
        globalMessage: globalMessage,
        reloadKey: reloadKey,
        selectedIds: selectedIds,
        modalActions: {
            isDialogOpen: isDialogOpen,
            revoke: revoke,
            closeDataDifferencesDialog: closeDataDifferencesDialog,
        },
        onTableActionClick: {
            activateMonitoringAction: activateMonitoringAction,
            approveAction: approveAction,
            completeAction: completeAction,
            deactivateMonitoringAction: deactivateMonitoringAction,
            getDifferenceAction: getDifferenceAction,
            getDifferenceAndRevokeAction: getDifferenceAndRevokeAction,
            incompleteAction: incompleteAction,
            revokeAction: revokeAction,
            submitAction: submitAction,
        },
    };
}
