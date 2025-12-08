import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React from "react";
import { useNavigate } from "react-router-dom";
import { DataSetConfiguration } from "../../domain/entities/DataSetConfiguration";
import i18n from "../../locales";
import { DataSetConfigTable } from "../components/dataset-config/DataSetConfigTable";
import { useAppContext } from "../contexts/app-context";

export const DataSetSettingsPage = () => {
    const { compositionRoot, config } = useAppContext();
    const navigate = useNavigate();
    const [dataSetConfigs, setDataSetConfigs] = React.useState<DataSetConfiguration[]>([]);
    const [selectedConfigId, setSelectedConfigId] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);
        return compositionRoot.dataSetConfig.getAll.execute().run(
            data => {
                setDataSetConfigs(data);
                setIsLoading(false);
            },
            error => {
                console.error(error);
                setIsLoading(false);
            }
        );
    }, [compositionRoot.dataSetConfig]);

    const goToAddConfig = () => {
        navigate("/datasets-settings/add");
    };

    const onAction = (params: { action: string; item: DataSetConfiguration }) => {
        switch (params.action) {
            case "edit": {
                navigate(`/datasets-settings/${params.item.id}/edit`);
                break;
            }
            case "delete": {
                setSelectedConfigId(params.item.id);
                break;
            }
            default:
                throw new Error(`Unknown action ${params.action}`);
        }
    };

    const deleteConfiguration = () => {
        if (!selectedConfigId) return;

        setIsLoading(true);
        compositionRoot.dataSetConfig.remove.execute(selectedConfigId).run(
            () => {
                setDataSetConfigs(prevConfigs => prevConfigs.filter(config => config.id !== selectedConfigId));
                setSelectedConfigId("");
                setIsLoading(false);
            },
            () => {
                setIsLoading(false);
            }
        );
    };

    return (
        <div>
            <ConfirmationDialog
                title={i18n.t("Delete DataSet Configuration")}
                description={i18n.t("Are you sure you want to delete this DataSet Configuration?")}
                cancelText={i18n.t("Close")}
                saveText={i18n.t("Delete")}
                onSave={deleteConfiguration}
                onCancel={() => setSelectedConfigId("")}
                open={selectedConfigId.length > 0}
                disableSave={isLoading}
            />

            <DataSetConfigTable
                data={dataSetConfigs}
                isSuperAdmin={config.currentUser.isAdmin}
                onAction={onAction}
                onAdd={goToAddConfig}
                loading={isLoading}
            />
        </div>
    );
};
