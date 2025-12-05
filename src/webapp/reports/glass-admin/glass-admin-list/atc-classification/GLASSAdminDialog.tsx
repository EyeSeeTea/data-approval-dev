import { ConfirmationDialog, ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useMemo, useState } from "react";
import i18n from "../../../../../locales";
import styled from "styled-components";
import {
    Input,
    // @ts-ignore
} from "@dhis2/ui";
import { CloudUpload } from "@material-ui/icons";
import { ATCItemIdentifier } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";

interface DialogProps extends ConfirmationDialogProps {
    title: string;
    description: string;
    uploadedYears?: string[];
    selectedItems?: ATCItemIdentifier[];
    closeModal(): void;
    saveFile(selectedFile: File | undefined, year: string, selectedItems?: ATCItemIdentifier[]): void;
}

export const GLASSAdminDialog: React.FC<DialogProps> = React.memo(props => {
    const { description, isOpen, selectedItems, title, uploadedYears, disableSave, closeModal, saveFile } = props;

    const [period, setPeriod] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

    const disableModalSave = useMemo(() => {
        return !!disableSave || !selectedFile || !!uploadedYears?.includes(period);
    }, [disableSave, period, uploadedYears, selectedFile]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        } else {
            setSelectedFile(undefined);
        }
    }, []);

    return (
        <ConfirmationDialog
            isOpen={isOpen}
            title={i18n.t(title)}
            onSave={() => saveFile(selectedFile, period, selectedItems)}
            onCancel={closeModal}
            saveText={i18n.t("Continue")}
            cancelText={i18n.t("Cancel")}
            disableSave={disableModalSave}
            maxWidth="md"
            fullWidth
        >
            <p>{i18n.t(description)}</p>

            {uploadedYears && (
                <StyledInput
                    type="number"
                    onChange={({ value }: { value: string }) => {
                        setPeriod(value);
                    }}
                    placeholder="Enter year"
                    value={period}
                    disabled={false}
                />
            )}

            <FileInputWrapper>
                <FileInputLabel htmlFor="upload">
                    <span>{i18n.t("Select File")}</span>
                    <CloudUpload />
                </FileInputLabel>
                <FileInput id="upload" type="file" accept=".zip,.rar,.7zip" onChange={handleFileChange} />
                {selectedFile && <p>{selectedFile.name}</p>}
            </FileInputWrapper>
        </ConfirmationDialog>
    );
});

const StyledInput = styled(Input)`
    width: 20%;
`;

const FileInputWrapper = styled.div`
    position: relative;
    margin-top: 1rem;
    width: min-width;
    display: flex;
    gap: 0.5rem;
`;

const FileInputLabel = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    border-radius: 0.5rem;
    background-color: #1976d2;
    font-size: 1rem;
    color: #fff;
`;

const FileInput = styled.input`
    display: none;
`;
