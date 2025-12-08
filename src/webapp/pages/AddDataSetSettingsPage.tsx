import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataSetConfiguration } from "../../domain/entities/DataSetConfiguration";
import { Alert } from "../components/alert/Alert";
import { DataSetConfigForm } from "../components/dataset-config/DataSetConfigForm";
import { useAppContext } from "../contexts/app-context";

export const AddDataSetSettingsPage = () => {
    const { id } = useParams();
    const { compositionRoot } = useAppContext();
    const [configuration, setConfiguration] = React.useState<DataSetConfiguration>();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!id) {
            setConfiguration(DataSetConfiguration.initial());
            return;
        }

        setIsLoading(true);
        return compositionRoot.dataSetConfig.getByCode.execute({ id }).run(
            configuration => {
                setConfiguration(configuration);
                setIsLoading(false);
            },
            () => {
                setIsLoading(false);
            }
        );
    }, [compositionRoot, id]);

    const goToList = React.useCallback(() => {
        navigate("/datasets-settings/list");
    }, [navigate]);

    const updateConfiguration = React.useCallback((newData: DataSetConfiguration) => {
        setConfiguration(newData);
    }, []);

    const saveConfiguration = React.useCallback(
        (config: DataSetConfiguration) => {
            setIsLoading(true);
            compositionRoot.dataSetConfig.save.execute(config).run(
                () => {
                    goToList();
                    setErrorMessage("");
                    setIsLoading(false);
                },
                error => {
                    setIsLoading(false);
                    setErrorMessage(error.message);
                }
            );
        },
        [compositionRoot, goToList]
    );

    if (!configuration) return null;

    return (
        <div>
            {errorMessage && <Alert message={errorMessage} />}

            <DataSetConfigForm
                configuration={configuration}
                onSave={saveConfiguration}
                onError={setErrorMessage}
                disableSave={isLoading}
                onCancel={goToList}
                onChange={updateConfiguration}
            />
        </div>
    );
};
