import React, { useCallback, useEffect, useState } from "react";
import { OrgUnitsFilter, OrgUnitsFilterProps } from "./OrgUnitsFilter";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../locales";
import { useBooleanState } from "../../utils/use-boolean";
import { TextField } from "material-ui";

export interface OrgUnitsFilterButtonProps extends OrgUnitsFilterProps {}

export const OrgUnitsFilterButton: React.FC<OrgUnitsFilterButtonProps> = React.memo(props => {
    const { compositionRoot } = useAppContext();
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);
    const loadingMessage = i18n.t("Loading...");
    const [selectedOrgUnits, setSelectedOrgUnits] = useState(loadingMessage);

    const clearSelectedOrgUnits = useCallback(() => {
        props.setSelected([]);
    }, [props]);

    useEffect(() => {
        setSelectedOrgUnits(loadingMessage);
        compositionRoot.orgUnits
            .get({ paths: props.selected })
            .then(orgUnits => setSelectedOrgUnits(orgUnits.map(ou => ou.name).join(", ")))
            .catch(() => setSelectedOrgUnits(props.selected.join(", ")));
    }, [compositionRoot, props.selected, loadingMessage]);

    return (
        <React.Fragment>
            <span onClick={openDialog} style={styles.textField}>
                <TextField
                    title={selectedOrgUnits}
                    value={selectedOrgUnits}
                    onChange={closeDialog}
                    floatingLabelText={i18n.t("Organisation unit")}
                />
            </span>

            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Select parent organisation unit")}
                onCancel={closeDialog}
                onInfoAction={clearSelectedOrgUnits}
                cancelText={i18n.t("Close")}
                infoActionText={i18n.t("Clear")}
                maxWidth="md"
                fullWidth
            >
                <OrgUnitsFilter {...props} />
            </ConfirmationDialog>
        </React.Fragment>
    );
});

const styles = {
    textField: { display: "inline-flex", marginTop: -24 },
};
