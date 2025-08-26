import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React from "react";
import i18n from "../../../locales";

export interface ReloadWarningModalProps {
    isOpen: boolean;
    onSave: () => void;
    onCancel: () => void;
}

const ReloadWarningModal: React.FC<ReloadWarningModalProps> = ({ isOpen, onSave, onCancel }) => {
    return (
        <ConfirmationDialog
            isOpen={isOpen}
            title={i18n.t("Confirm Validation Reload")}
            onSave={onSave}
            onCancel={onCancel}
            saveText={i18n.t("Confirm")}
            cancelText={i18n.t("Cancel")}
            maxWidth="md"
            fullWidth
        >
            <div>
                <p>
                    {i18n.t(
                        "This action will delete the stored data and process all the Indicators and Program Indicators from this DHIS2 instance."
                    )}
                </p>
                <p>{i18n.t("This will take a long time.")}</p>
                <b>{i18n.t("Are you sure?")}</b>
            </div>
        </ConfirmationDialog>
    );
};

export default React.memo(ReloadWarningModal);
