import { useCallback } from "react";
import _ from "lodash";
import { DataApprovalViewModel } from "../../DataApprovalViewModel";
import { Id } from "../../../../../domain/common/entities/Base";
import { useAppContext } from "../../../../contexts/app-context";
import { Config } from "../../../../../domain/common/entities/Config";
import { DataSetWithConfigPermissions } from "../../../../../domain/usecases/GetApprovalConfigurationsUseCase";
import { DataSetConfigurationAction } from "../../../../../domain/entities/DataSetConfiguration";

type ActiveDataApprovalActionsState = {
    isApproveActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isCompleteActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isGetDifferenceActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isGetDifferenceAndRevokeActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isIncompleteActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isRevokeActionVisible: (rows: DataApprovalViewModel[]) => boolean;
    isSubmitActionVisible: (rows: DataApprovalViewModel[]) => boolean;
};

export function getDataSetAccess(options: {
    action: DataSetConfigurationAction;
    user: Config["currentUser"];
    dataSetsConfig: DataSetWithConfigPermissions[];
    dataSetId: Id;
}) {
    const { action, user, dataSetsConfig, dataSetId } = options;
    const dataSetConfig = dataSetsConfig.find(ds => ds.dataSet.id === dataSetId);
    const hasAccess = dataSetConfig?.configuration.canUserPerformAction(
        action,
        user.username,
        user.userGroups.map(ug => ug.code),
        user.isAdmin
    );
    return hasAccess ?? false;
}

export function useActiveDataApprovalActions(props: {
    dataSetsConfig: DataSetWithConfigPermissions[];
}): ActiveDataApprovalActionsState {
    const { dataSetsConfig } = props;
    const { config } = useAppContext();

    const isApproveActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => {
            return _.every(rows, row => {
                const hasAccess = getDataSetAccess({
                    action: "approve",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return row.lastUpdatedValue && Number(row.modificationCount) > 0 && hasAccess;
            });
        },
        [config.currentUser, dataSetsConfig]
    );

    const isCompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const hasAccess = getDataSetAccess({
                    action: "complete",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return !row.completed && row.lastUpdatedValue && Boolean(hasAccess);
            }),
        [config.currentUser, dataSetsConfig]
    );

    const isGetDifferenceActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) => {
            return _.every(rows, row => {
                const hasApproveAccess = getDataSetAccess({
                    action: "approve",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });

                const hasReadAccess = getDataSetAccess({
                    action: "read",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return row.lastUpdatedValue && Number(row.modificationCount) > 0 && hasApproveAccess && hasReadAccess;
            });
        },
        [dataSetsConfig, config.currentUser]
    );

    const isGetDifferenceAndRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const hasReadAccess = getDataSetAccess({
                    action: "read",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return row.lastUpdatedValue && row.validated && hasReadAccess;
            }),
        [dataSetsConfig, config.currentUser]
    );

    const isIncompleteActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess({
                    action: "incomplete",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return row.completed && !row.validated && access;
            }),
        [dataSetsConfig, config.currentUser]
    );

    const isSubmitActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess({
                    action: "submit",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return !row.approved && row.lastUpdatedValue && access;
            }),
        [dataSetsConfig, config.currentUser]
    );

    const isRevokeActionVisible = useCallback(
        (rows: DataApprovalViewModel[]) =>
            _.every(rows, row => {
                const access = getDataSetAccess({
                    action: "revoke",
                    user: config.currentUser,
                    dataSetsConfig,
                    dataSetId: row.dataSetUid,
                });
                return row.approved && access;
            }),
        [dataSetsConfig, config.currentUser]
    );

    return {
        isApproveActionVisible: isApproveActionVisible,
        isCompleteActionVisible: isCompleteActionVisible,
        isGetDifferenceActionVisible: isGetDifferenceActionVisible,
        isGetDifferenceAndRevokeActionVisible: isGetDifferenceAndRevokeActionVisible,
        isIncompleteActionVisible: isIncompleteActionVisible,
        isRevokeActionVisible: isRevokeActionVisible,
        isSubmitActionVisible: isSubmitActionVisible,
    };
}
