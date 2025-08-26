import React, { useMemo } from "react";
import styled from "styled-components";
import { ObjectsList, TableColumn, TableConfig, useObjectsTable } from "@eyeseetea/d2-ui-components";
import { useFiles } from "./useFiles";
import { DataMaintenanceViewModel } from "../../DataMaintenanceViewModel";
import i18n from "../../../../../locales";
import { Delete } from "@material-ui/icons";
import _ from "lodash";
import { Filter } from "./Filter";
import { Button } from "@material-ui/core";

export interface AMCReportProps {
    filters: Filter;
}

export const AMCReport: React.FC<AMCReportProps> = React.memo(props => {
    const { filters } = props;
    const { getFiles, pagination, initialSorting, filesToDelete, deleteFiles, visibleColumns, saveReorderedColumns } =
        useFiles(filters);

    const baseConfig: TableConfig<DataMaintenanceViewModel> = useMemo(
        () => ({
            actions: [
                {
                    name: "delete",
                    text: i18n.t("Delete"),
                    icon: <Delete />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => deleteFiles(selectedIds),
                    isActive: (rows: DataMaintenanceViewModel[]) => {
                        return _.every(rows, row => row.status !== "DELETED");
                    },
                },
            ],
            columns: [
                { name: "fileName", text: i18n.t("File"), sortable: true },
                { name: "orgUnitName", text: i18n.t("Country"), sortable: true },
                { name: "period", text: i18n.t("Year"), sortable: true },
                {
                    name: "status",
                    text: i18n.t("Status"),
                    sortable: true,
                },
            ],
            initialSorting: initialSorting,
            paginationOptions: pagination,
        }),
        [deleteFiles, initialSorting, pagination]
    );

    const tableProps = useObjectsTable<DataMaintenanceViewModel>(baseConfig, getFiles);

    const columnsToShow = useMemo<TableColumn<DataMaintenanceViewModel>[]>(() => {
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
                <Button onClick={() => deleteFiles(filesToDelete)} color="primary" variant="contained">
                    {i18n.t("Delete all incomplete files")}
                </Button>
            </StyledButtonContainer>

            <ObjectsList<DataMaintenanceViewModel>
                {...tableProps}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
            />
        </React.Fragment>
    );
});

const StyledButtonContainer = styled.div`
    display: flex;
    justify-content: end;
    gap: 1rem;
`;
