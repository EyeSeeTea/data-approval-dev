import { ObjectsTable, TableConfig } from "@eyeseetea/d2-ui-components";
import EditIcon from "@material-ui/icons/EditOutlined";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import { DataSetConfiguration } from "../../../domain/entities/DataSetConfiguration";
import i18n from "../../../locales";

type DataSetConfigTableProps = {
    data: DataSetConfiguration[];
    isSuperAdmin: boolean;
    onAction: (params: { action: string; item: DataSetConfiguration }) => void;
    onAdd?: () => void;
    loading?: boolean;
};

export const DataSetConfigTable: React.FC<DataSetConfigTableProps> = props => {
    const { data, isSuperAdmin, onAction, onAdd, loading } = props;

    const tableConfig: TableConfig<DataSetConfiguration> = {
        columns: [
            {
                name: "dataSetOriginalCode",
                text: i18n.t("DataSet Code"),
                sortable: false,
            },
            {
                name: "dataSetDestinationCode",
                text: i18n.t("DataSet Approval Code"),
                sortable: false,
            },
            {
                name: "submissionDateCode",
                text: i18n.t("DataElement Submission Date"),
                sortable: false,
            },
            {
                name: "approvalDateCode",
                text: i18n.t("DataElement Approval Date"),
                sortable: false,
            },
        ],
        actions: [
            {
                name: "edit",
                text: i18n.t("Edit"),
                icon: <EditIcon />,
                isActive: () => isSuperAdmin,
                onClick: item => {
                    const action = getItemByAction({ data, action: "edit", item });
                    if (action) onAction(action);
                },
                multiple: false,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                icon: <DeleteIcon />,
                isActive: () => isSuperAdmin,
                onClick: item => {
                    const action = getItemByAction({ data, action: "delete", item });
                    if (action) onAction(action);
                },
                multiple: false,
            },
        ],
        onActionButtonClick: isSuperAdmin
            ? () => {
                  if (onAdd) onAdd();
              }
            : undefined,
        initialSorting: { field: "id", order: "asc" },
        paginationOptions: { pageSizeInitialValue: 50, pageSizeOptions: [50] },
    };

    return <ObjectsTable {...tableConfig} onChange={console.debug} rows={data} loading={loading} />;
};

function getItemByAction(props: { data: DataSetConfiguration[]; action: string; item: string[] }) {
    const { data, action, item } = props;
    const firstId = item[0];
    const dsConfig = data.find(config => config.id === firstId);
    if (!dsConfig) return;
    return { action: action, item: dsConfig };
}
