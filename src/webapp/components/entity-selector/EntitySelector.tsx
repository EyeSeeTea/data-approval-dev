import React from "react";
import styled from "styled-components";
import { Button, TextField, Typography } from "@material-ui/core";
import {
    ConfirmationDialog,
    ObjectsTable,
    TableConfig,
    TablePagination,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../locales";
import { MetadataEntityType } from "../../../domain/repositories/MetadataEntityRepository";

type EntitySelectorProps = {
    label: string;
    value: string;
    type: MetadataEntityType;
    onChange: (entity: TableEntity) => void;
    onlyWithCode?: boolean;
};

export const EntitySelector = (props: EntitySelectorProps) => {
    const { label, onChange, value, type, onlyWithCode } = props;
    const [showModal, setShowModal] = React.useState(false);
    const [selectedEntity, setSelectedEntity] = React.useState<TableEntity>();

    const openTable = React.useCallback(() => {
        setShowModal(true);
    }, []);

    const selectEntity = React.useCallback(
        (entity: TableEntity) => {
            onChange(entity);
            setShowModal(false);
            setSelectedEntity(entity);
        },
        [onChange]
    );

    return (
        <div>
            <TextField
                required
                onClick={openTable}
                label={label}
                value={selectedEntity ? selectedEntity.code ?? selectedEntity.name : value}
                inputProps={{ readOnly: true }}
                fullWidth
            />
            <ConfirmationDialog
                cancelText={i18n.t("Close")}
                onCancel={() => setShowModal(false)}
                maxWidth="lg"
                open={showModal}
                onClose={() => setShowModal(false)}
            >
                <TableSelectorContainer>
                    <Typography variant="caption">{i18n.t("Click on the ID to select the row")}</Typography>
                    <TableSelector type={type} onChange={selectEntity} onlyWithCode={onlyWithCode} />
                </TableSelectorContainer>
            </ConfirmationDialog>
        </div>
    );
};

export function TableSelector(props: TableSelectorProps) {
    const { type, onChange, onlyWithCode } = props;
    const [loading, setLoading] = React.useState(false);
    const { compositionRoot } = useAppContext();

    const getRows = React.useCallback(
        (search: string, pagination: TablePagination) => {
            setLoading(true);
            return compositionRoot.metadata.getBy
                .execute({
                    type,
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    onlyWithCode: onlyWithCode ?? false,
                    search: search,
                })
                .toPromise()
                .then(result => {
                    setLoading(false);
                    return result;
                })
                .catch(() => {
                    setLoading(false);
                    return { objects: [], pager: { page: 1, pageCount: 1, pageSize: pagination.pageSize, total: 0 } };
                });
        },
        [compositionRoot.metadata.getBy, type, onlyWithCode]
    );

    const onSelectRow = React.useCallback(
        row => {
            onChange(row);
        },
        [onChange]
    );

    const config: TableConfig<TableEntity> = React.useMemo(() => {
        return {
            actions: [],
            columns: [
                {
                    name: "id",
                    text: "ID",
                    sortable: false,
                    getValue: row => {
                        return (
                            <Button variant="contained" color="primary" onClick={() => onSelectRow(row)}>
                                {row.id}
                            </Button>
                        );
                    },
                },
                { name: "name", text: "Name", sortable: false },
                { name: "code", text: "Code", sortable: false },
            ],
            initialSorting: { field: "id", order: "asc" },
            paginationOptions: { pageSizeInitialValue: 25, pageSizeOptions: [25, 50, 100] },
        };
    }, [onSelectRow]);

    const tableConfig = useObjectsTable<TableEntity>(config, getRows);

    return <ObjectsTable {...tableConfig} loading={loading} />;
}

const TableSelectorContainer = styled.div`
    padding: 1em;
`;

type TableSelectorProps = {
    onlyWithCode?: boolean;
    type: MetadataEntityType;
    onChange: (entity: TableEntity) => void;
};

export type TableEntity = {
    id: string;
    name: string;
    code: string;
};
