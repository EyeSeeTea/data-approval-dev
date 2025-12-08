import React from "react";
import { useNavigate } from "react-router-dom";
import { DataSetConfiguration } from "../../domain/entities/DataSetConfiguration";
import { DataSetConfigTable } from "../components/dataset-config/DataSetConfigTable";
import { useAppContext } from "../contexts/app-context";

export const DataSetSettingsPage = () => {
    const { compositionRoot, config } = useAppContext();
    const navigate = useNavigate();
    const [dataSetConfigs, setDataSetConfigs] = React.useState<DataSetConfiguration[]>([]);

    React.useEffect(() => {
        return compositionRoot.dataSetConfig.getAll.execute().run(setDataSetConfigs, console.error);
    }, [compositionRoot.dataSetConfig]);

    const goToAddConfig = () => {
        navigate("/datasets-settings/add");
    };

    const onAction = (params: { action: string; item: DataSetConfiguration }) => {
        navigate(`/datasets-settings/${params.item.id}/edit`);
    };

    return (
        <div>
            <DataSetConfigTable
                data={dataSetConfigs}
                isSuperAdmin={config.currentUser.isAdmin}
                onAction={onAction}
                onAdd={goToAddConfig}
            />
        </div>
    );
};
