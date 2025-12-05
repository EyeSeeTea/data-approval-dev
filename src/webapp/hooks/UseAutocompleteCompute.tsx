import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import React from "react";
import { AutoCompleteComputeSettings } from "../../domain/reports/nhwa-auto-complete-compute/entities/AutoCompleteComputeSettings";
import { useAppContext } from "../contexts/app-context";

type UseSettingsProps = { settingKey: string };

export function useSettings(props: UseSettingsProps) {
    const { compositionRoot } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const [settings, setSettings] = React.useState<AutoCompleteComputeSettings>();

    React.useEffect(() => {
        compositionRoot.nhwa.getAutoCompleteComputeSettings
            .execute({ settingsKey: props.settingKey })
            .then(result => {
                setSettings(result);
            })
            .catch(error => {
                snackbar.error(error.message);
            });
    }, [props.settingKey, compositionRoot, loading, snackbar]);

    return { settings };
}
