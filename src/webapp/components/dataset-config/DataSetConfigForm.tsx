import { Button, createStyles, Grid, makeStyles, Paper, Theme } from "@material-ui/core";
import React from "react";
import {
    DataSetConfiguration,
    DataSetConfigurationAction,
    dataSetConfigurationActions,
} from "../../../domain/entities/DataSetConfiguration";
import { Maybe } from "../../../types/utils";
import i18n from "../../../locales";
import { PermissionsSharing } from "../share/PermissionsSharing";
import _ from "../../../domain/generic/Collection";
import { EntitySelector, TableEntity } from "../entity-selector/EntitySelector";

type DataSetConfigFormProps = {
    configuration: DataSetConfiguration;
    onChange: (configuration: DataSetConfiguration) => void;
    onSave: (configuration: DataSetConfiguration) => void;
    onError: (message: string) => void;
    disableSave?: boolean;
    onCancel: () => void;
};

export const DataSetConfigForm: React.FC<DataSetConfigFormProps> = props => {
    const { configuration, disableSave, onCancel, onChange, onSave, onError } = props;

    const [selectedPermission, setSelectedPermission] = React.useState<DataSetConfigurationAction>();

    const classes = useStyles();

    const selectPermission = (action: Maybe<DataSetConfigurationAction>) => {
        setSelectedPermission(action);
    };

    const updateDataSet = (code: string, type: "original" | "destination") => {
        const newConfiguration =
            type === "original"
                ? configuration.updateDataSetOriginal(code)
                : configuration.updateDataSetDestination(code);
        onChange(newConfiguration);
    };

    const updateDataElement = (code: string, type: "submit" | "approval") => {
        const newConfiguration =
            type === "submit"
                ? configuration.updateSubmissionDateDataElement(code)
                : configuration.updateApprovalDateDataElement(code);
        onChange(newConfiguration);
    };

    const updateDataSource = (entity: TableEntity) => {
        const newConfiguration = configuration.updateDataSourceId(entity.name);
        onChange(newConfiguration);
    };

    const handleSubmit = React.useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const errors = DataSetConfiguration.validate(configuration);
            if (errors.length > 0) {
                onError(i18n.t("Please complete all required fields."));
            } else {
                onSave(configuration);
            }
        },
        [configuration, onSave, onError]
    );

    return (
        <Paper>
            <form onSubmit={handleSubmit} className={classes.form}>
                <Grid container className={classes.container} spacing={1}>
                    <Grid item xs={6}>
                        <EntitySelector
                            type="dataSets"
                            label={i18n.t("DataSet")}
                            value={configuration.dataSetOriginalCode}
                            onChange={entity => updateDataSet(entity.code, "original")}
                            onlyWithCode
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <EntitySelector
                            type="dataSets"
                            label={i18n.t("DataSet Approval")}
                            value={configuration.dataSetDestinationCode}
                            onChange={entity => updateDataSet(entity.code, "destination")}
                            onlyWithCode
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <EntitySelector
                            type="dataElements"
                            label={i18n.t("Submit Date DataElement")}
                            value={configuration.submissionDateCode}
                            onChange={entity => updateDataElement(entity.code, "submit")}
                            onlyWithCode
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <EntitySelector
                            type="dataElements"
                            label={i18n.t("Approval Date DataElement")}
                            value={configuration.approvalDateCode}
                            onChange={entity => updateDataElement(entity.code, "approval")}
                            onlyWithCode
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <EntitySelector
                            type="sqlViews"
                            label={i18n.t("Data Source")}
                            value={configuration.dataSourceId}
                            onChange={updateDataSource}
                        />
                    </Grid>
                    <div className={classes.permissionContainer}>
                        {dataSetConfigurationActions.map(action => {
                            const { userGroups, users } = configuration.permissions[action];

                            return (
                                <div key={action} className={classes.permissionItem}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => selectPermission(action)}
                                        fullWidth
                                        size="small"
                                    >
                                        {i18n.t('Edit "{{action}}" Permissions', { action })}
                                    </Button>
                                    <PermissionsSharing
                                        title={action}
                                        visible={selectedPermission === action}
                                        usernames={users}
                                        userGroupCodes={userGroups}
                                        onClose={() => selectPermission(undefined)}
                                        onChange={params => {
                                            const updatedPermissions = configuration.updatePermissions({
                                                action: action,
                                                userGroupCodes: _(params.userGroupCodes).uniq().value(),
                                                usernames: _(params.usernames).uniq().value(),
                                            });
                                            onChange(updatedPermissions);
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <Grid className={classes.btnContainer} item xs={12}>
                        <Button variant="contained" disabled={disableSave} color="primary" type="submit" size="large">
                            {i18n.t("Save")}
                        </Button>
                        <Button variant="contained" color="primary" type="button" onClick={onCancel} size="large">
                            {i18n.t("Cancel")}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        btnContainer: {
            paddingInlineStart: theme.spacing(1),
            gap: theme.spacing(1),
            display: "flex",
        },
        container: {
            rowGap: theme.spacing(2),
        },
        form: {
            padding: theme.spacing(2),
        },
        permissionContainer: {
            display: "grid",
            gap: theme.spacing(2),
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            width: "100%",
        },
        permissionItem: {
            display: "flex",
        },
    })
);
