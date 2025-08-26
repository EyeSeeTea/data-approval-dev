import { Button, Chip } from "@material-ui/core";
import React, { useMemo, useState } from "react";
import i18n from "../../../../../locales";
import {
    ConfirmationDialog,
    ObjectsList,
    TableColumn,
    TableConfig,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import { ATCViewModel, getVersion } from "../../DataMaintenanceViewModel";
import { CloudUpload } from "@material-ui/icons";
import { useATC } from "./useATC";
import _ from "lodash";
import styled from "styled-components";
import { GLASSAdminDialog } from "./GLASSAdminDialog";
import {
    ATCItemIdentifier,
    parseATCItemId,
} from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { useATCUpload } from "./useATCUpload";
import { useATCActions } from "./useATCActions";

export const ATCClassificationList: React.FC = React.memo(() => {
    const { initialSorting, pagination, uploadedYears, visibleColumns, getATCs, reload, saveReorderedColumns } =
        useATC();
    const {
        isPatchModalOpen,
        isUploadATCModalOpen,
        isRecalculateLogicModalOpen,
        closePatchModal,
        closeUploadATCModal,
        closeRecalculateLogicModal,
        openPatchModal,
        openUploadATCModal,
        openRecalculateLogicModal,
    } = useATCUpload();
    const {
        isRecalculating,
        isPatchingNewVersion,
        isUploadingNewATC,
        isRecalculated,
        cancelRecalculation,
        patchVersion,
        saveRecalculationLogic,
        uploadATCFile,
    } = useATCActions(reload, closePatchModal, closeUploadATCModal, closeRecalculateLogicModal);

    const [isCurrentVersion, setCurrentVersion] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<ATCItemIdentifier[]>([]);

    const baseConfig: TableConfig<ATCViewModel> = useMemo(
        () => ({
            actions: [
                {
                    name: "patch",
                    text: i18n.t("Patch"),
                    icon: <CloudUpload />,
                    onClick: async (selectedIds: string[]) => {
                        openPatchModal();
                        const items = _.compact(selectedIds.map(item => parseATCItemId(item)));
                        if (items.length === 0) return;

                        setSelectedItems(items);

                        const isCurrentVersion = _(items)
                            .map(item => item.currentVersion)
                            .every();
                        setCurrentVersion(isCurrentVersion);
                    },
                },
            ],
            columns: [
                {
                    name: "currentVersion",
                    text: i18n.t(" "),
                    sortable: false,
                    getValue: row => row.currentVersion && <Chip color="primary" label={i18n.t("Current Version")} />,
                },
                { name: "year", text: i18n.t("Year"), sortable: true },
                { name: "uploadedDate", text: i18n.t("Uploaded date"), sortable: true },
            ],
            initialSorting: initialSorting,
            paginationOptions: pagination,
        }),
        [initialSorting, openPatchModal, pagination]
    );

    const tableProps = useObjectsTable<ATCViewModel>(baseConfig, getATCs);
    const previousVersionExists = tableProps.rows.some(row => row.previousVersion);

    const columnsToShow = useMemo<TableColumn<ATCViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]);

    return (
        <React.Fragment>
            <StyledButtonContainer>
                <Button onClick={openUploadATCModal} color="primary" variant="contained">
                    {i18n.t("Upload new ATC file")}
                </Button>

                {isRecalculated && (
                    <>
                        <Button color="default" variant="contained" disabled>
                            {i18n.t("Recalculation Ongoing...")}
                        </Button>{" "}
                        <CancelButton onClick={cancelRecalculation} variant="contained">
                            {i18n.t("Cancel recalculation")}
                        </CancelButton>
                    </>
                )}

                {isRecalculated === false && (
                    <Button onClick={openRecalculateLogicModal} color="primary" variant="contained">
                        {i18n.t("Recalculate logic")}
                    </Button>
                )}
            </StyledButtonContainer>

            <ObjectsList<ATCViewModel>
                {...tableProps}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
            />

            <GLASSAdminDialog
                selectedItems={selectedItems}
                isOpen={isPatchModalOpen}
                closeModal={closePatchModal}
                description={
                    isCurrentVersion
                        ? "You are replacing the latest ATC file. It will become the default version"
                        : "You are replacing an old ATC file. It won't affect calculations"
                }
                title="Patch version"
                disableSave={isPatchingNewVersion}
                saveFile={patchVersion}
            />

            <GLASSAdminDialog
                isOpen={isUploadATCModalOpen}
                closeModal={closeUploadATCModal}
                description="All years will be overwritten with the data provided in this file."
                title="Upload new ATC file"
                disableSave={isUploadingNewATC}
                uploadedYears={uploadedYears}
                saveFile={uploadATCFile}
            />

            <ConfirmationDialog
                isOpen={isRecalculateLogicModalOpen}
                title={"Recalculate"}
                onSave={saveRecalculationLogic}
                onCancel={closeRecalculateLogicModal}
                saveText={i18n.t(isRecalculating ? "Recalculating..." : "Start recalculation")}
                cancelText={i18n.t("Cancel")}
                disableSave={isRecalculating}
                maxWidth="md"
                fullWidth
            >
                {previousVersionExists && (
                    <p>
                        {i18n.t("Last recalculation was done with {{previousVersion}}", {
                            previousVersion: getVersion(tableProps.rows, "previousVersion"),
                        })}
                    </p>
                )}
                <p>
                    {i18n.t("RECALCULATE all existing submissions with {{currentVersion}}", {
                        currentVersion: getVersion(tableProps.rows, "currentVersion"),
                    })}
                </p>
                <p>{i18n.t("There is no UNDO for this action")}</p>
            </ConfirmationDialog>
        </React.Fragment>
    );
});

const StyledButtonContainer = styled.div`
    display: flex;
    justify-content: end;
    gap: 1rem;
`;

const CancelButton = styled(Button)`
    background-color: #f44336;
    color: white;
    &:hover {
        background-color: #d32f2f;
    }
`;
