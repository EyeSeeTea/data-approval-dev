import { ConfirmationDialog, MultiSelector } from "@eyeseetea/d2-ui-components";
import React from "react";
import i18n from "../../../locales";
import { TextField } from "material-ui";
import { useBooleanState } from "../../utils/use-boolean";
import { useAppContext } from "../../contexts/app-context";

interface Option {
    value: string;
    text: string;
}

export interface MultiSelectorFilterButtonProps {
    onChange(values: string[]): void;
    options: Option[];
    selectedItems: string[];
    title: string;
    value?: string;
}

export const MultiSelectorFilterButton: React.FC<MultiSelectorFilterButtonProps> = React.memo(props => {
    const { api } = useAppContext();
    const { onChange, options, selectedItems, title, value } = props;
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    return (
        <React.Fragment>
            <span onClick={openDialog} style={styles.textField}>
                <TextField
                    fullWidth
                    title={title}
                    value={value ?? selectedItems.join(", ")}
                    floatingLabelText={i18n.t(title)}
                />
            </span>

            {isDialogOpen && (
                <ConfirmationDialog
                    isOpen={isDialogOpen}
                    title={i18n.t(title)}
                    onCancel={closeDialog}
                    cancelText={i18n.t("Close")}
                    maxWidth="md"
                    fullWidth
                >
                    <MultiSelector selected={selectedItems} options={options} onChange={onChange} d2={api} />
                </ConfirmationDialog>
            )}
        </React.Fragment>
    );
});

const styles = {
    textField: { display: "flex" },
};
