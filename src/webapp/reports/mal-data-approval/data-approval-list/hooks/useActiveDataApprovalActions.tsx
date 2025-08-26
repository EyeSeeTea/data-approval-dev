import { useCallback } from "react";
import _ from "lodash";
import { DataApprovalViewModel } from "../../DataApprovalViewModel";
import { useDataApprovalPermissions } from "./useDataApprovalPermissions";
import { Id } from "../../../../../domain/common/entities/Base";
import { useAppContext } from "../../../../contexts/app-context";
import { Config } from "../../../../../domain/common/entities/Config";

type ActiveDataApprovalActionsState = {
    isActivateMonitoringActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isApproveActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isCompleteActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isDeactivateMonitoringActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isGetDifferenceActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isGetDifferenceAndRevokeActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isIncompleteActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isRevokeActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isSubmitActionVisible: (rows: DataApprovalViewModel[]) => boolean;
};

function getDataSetAccess(config: Config, dataSetId: Id) {
    const access = config.currentUser.dataSets ? config.currentUser.dataSets[dataSetId] : undefined;
    return access;
}

export function useActiveDataApprovalActions(): ActiveDataApprovalActionsState {
    const { config } = useAppContext();
    const { isMalAdmin } = useDataApprovalPermissions();

    const isActivateMonitoringActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => {
            return _(rows).every(row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return !row.monitoring && Boolean(isMalAdmin || access?.monitoring);
            });
        },
        [isMalAdmin, config]
    );

    const isApproveActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => {
            return _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return (
                    row.lastUpdatedValue && Number(row.modificationCount) > 0 && Boolean(isMalAdmin || access?.approve)
                );
            });
        },
        [isMalAdmin, config]
    );

    const isCompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return !row.completed && row.lastUpdatedValue && Boolean(isMalAdmin || access?.complete);
            }),
        [isMalAdmin, config]
    );

    const isDeactivateMonitoringActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return row.monitoring && Boolean(isMalAdmin || access?.monitoring);
            }),
        [isMalAdmin, config]
    );

    const isGetDifferenceActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return (
                    row.lastUpdatedValue &&
                    !row.validated &&
                    Number(row.modificationCount) > 0 &&
                    Boolean(access?.read || isMalAdmin)
                );
            }),
        [isMalAdmin, config]
    );

    const isGetDifferenceAndRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return row.lastUpdatedValue && row.validated && Boolean(access?.read || isMalAdmin);
            }),
        [isMalAdmin, config]
    );

    const isIncompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return row.completed && !row.validated && Boolean(isMalAdmin || access?.incomplete);
            }),
        [isMalAdmin, config]
    );

    const isSubmitActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return !row.approved && row.lastUpdatedValue && Boolean(access?.submit || isMalAdmin);
            }),
        [isMalAdmin, config]
    );

    const isRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess(config, row.dataSetUid);
                return row.approved && Boolean(isMalAdmin || access?.revoke);
            }),
        [isMalAdmin, config]
    );

    return {
        isActivateMonitoringActionVisible: isActivateMonitoringActionVisible,
        isApproveActionVisible: isApproveActionVisible,
        isCompleteActionVisible: isCompleteActionVisible,
        isDeactivateMonitoringActionVisible: isDeactivateMonitoringActionVisible,
        isGetDifferenceActionVisible: isGetDifferenceActionVisible,
        isGetDifferenceAndRevokeActionVisible: isGetDifferenceAndRevokeActionVisible,
        isIncompleteActionVisible: isIncompleteActionVisible,
        isRevokeActionVisible: isRevokeActionVisible,
        isSubmitActionVisible: isSubmitActionVisible,
    };
}
