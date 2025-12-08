import { Struct } from "../generic/Struct";
import { Code, Id } from "../common/entities/Base";
import { generateUid } from "../../utils/uid";
import { ValidationError } from "../generic/Errors";
import { Maybe } from "../../types/utils";
import _ from "../generic/Collection";

export type DataSetConfigurationPermissions = {
    userGroups: string[];
    users: string[];
};

export type DataSetConfigurationDataElements = {
    submissionDateCode: string;
    approvalDateCode: string;
};

export type DataSetConfigurationAttrs = {
    id: string;
    dataSetOriginalCode: string;
    dataSetDestinationCode: string;
    submissionDateCode: string;
    approvalDateCode: string;
    permissions: Record<DataSetConfigurationAction, DataSetConfigurationPermissions>;
    dataSourceId: Id;
    submitAndComplete: boolean;
    revokeAndIncomplete: boolean;
};

export class DataSetConfiguration extends Struct<DataSetConfigurationAttrs>() {
    static CODE_PREFIX = "DS_";
    static EMPTY_PERMISSIONS: DataSetConfigurationPermissions = { users: [], userGroups: [] };

    get code(): string {
        return `${DataSetConfiguration.CODE_PREFIX}${this.dataSetOriginalCode}_${this.dataSetDestinationCode}`;
    }

    static initial(): DataSetConfiguration {
        return new DataSetConfiguration({
            id: generateUid(),
            dataSetOriginalCode: "",
            dataSetDestinationCode: "",
            submissionDateCode: "",
            approvalDateCode: "",
            permissions: this.getEmptyPermissions(),
            dataSourceId: "",
            submitAndComplete: false,
            revokeAndIncomplete: false,
        });
    }

    updatePermissions(options: { action: DataSetConfigurationAction; usernames: string[]; userGroupCodes: string[] }) {
        const { action, usernames, userGroupCodes } = options;
        return this._update({
            permissions: { ...this.permissions, [action]: { users: usernames, userGroups: userGroupCodes } },
        });
    }

    updateDataSetOriginal(newDataSetCode: string): DataSetConfiguration {
        return this._update({ dataSetOriginalCode: newDataSetCode });
    }

    updateDataSetDestination(newDataSetCode: string): DataSetConfiguration {
        return this._update({ dataSetDestinationCode: newDataSetCode });
    }

    updateSubmissionDateDataElement(newDataElementCode: string): DataSetConfiguration {
        return this._update({ submissionDateCode: newDataElementCode });
    }

    updateApprovalDateDataElement(newDataElementCode: string): DataSetConfiguration {
        return this._update({ approvalDateCode: newDataElementCode });
    }

    updateDataSourceId(id: Id): DataSetConfiguration {
        return this._update({ dataSourceId: id });
    }

    updateSubmitAndComplete(value: boolean): DataSetConfiguration {
        return this._update({ submitAndComplete: value });
    }

    updateRevokeAndIncomplete(value: boolean): DataSetConfiguration {
        return this._update({ revokeAndIncomplete: value });
    }

    hasPermission(action: DataSetConfigurationAction, username: string, userGroupCodes: Code[]): boolean {
        const actionPermissions = this.permissions[action];

        // Check if user has direct permission
        if (actionPermissions.users.includes(username)) {
            return true;
        }

        // Check if user belongs to any group with permission
        return userGroupCodes.some(groupCode => actionPermissions.userGroups.includes(groupCode));
    }

    canUserPerformAction(
        action: DataSetConfigurationAction,
        username: string,
        userGroupCodes: Code[],
        isSuperAdmin: boolean
    ): boolean {
        return isSuperAdmin ? true : this.hasPermission(action, username, userGroupCodes);
    }

    public static validate(data: DataSetConfigurationAttrs): DataSetConfigurationError[] {
        const validationResults = _([
            this.validateRequired("dataSetOriginalCode", data.dataSetOriginalCode),
            this.validateRequired("dataSetDestinationCode", data.dataSetDestinationCode),
            this.validateRequired("submissionDateCode", data.submissionDateCode),
            this.validateRequired("approvalDateCode", data.approvalDateCode),
            this.validateRequired("dataSourceId", data.dataSourceId),
        ])
            .compact()
            .value();

        return validationResults.flatMap(result => (result !== undefined ? [result] : []));
    }

    dataSetsAreEqual(): boolean {
        return this.dataSetOriginalCode === this.dataSetDestinationCode;
    }

    private static validateRequired<K extends keyof DataSetConfigurationAttrs>(
        property: K,
        value: DataSetConfigurationAttrs[K]
    ): Maybe<DataSetConfigurationError> {
        return value ? undefined : { property, value, errors: ["field_cannot_be_blank"] };
    }

    private static getEmptyPermissions(): Record<DataSetConfigurationAction, DataSetConfigurationPermissions> {
        return {
            read: DataSetConfiguration.EMPTY_PERMISSIONS,
            complete: DataSetConfiguration.EMPTY_PERMISSIONS,
            incomplete: DataSetConfiguration.EMPTY_PERMISSIONS,
            revoke: DataSetConfiguration.EMPTY_PERMISSIONS,
            submit: DataSetConfiguration.EMPTY_PERMISSIONS,
            approve: DataSetConfiguration.EMPTY_PERMISSIONS,
        };
    }
}

export const dataSetConfigurationActions = ["read", "complete", "incomplete", "revoke", "submit", "approve"] as const;

export type DataSetConfigurationAction = typeof dataSetConfigurationActions[number];
type DataSetConfigurationError = ValidationError<DataSetConfigurationAttrs>;
