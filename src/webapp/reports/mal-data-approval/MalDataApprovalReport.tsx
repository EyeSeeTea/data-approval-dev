import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";
import { IconButton } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { useLoaderData, useNavigate } from "react-router-dom";
import { DataSetConfigLoader } from "../Reports";

const MalDataApprovalStatusReport: React.FC = () => {
    const { config } = useAppContext();
    // TODO: update to react-router v7 which has better types support
    const loaderData = useLoaderData() as DataSetConfigLoader;
    const navigate = useNavigate();
    const classes = useStyles();

    const goToSettings = () => {
        navigate("/datasets-settings/list");
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.container}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("Data Approval Report")}
                </Typography>

                {config.currentUser.isAdmin && (
                    <div className={classes.iconContainer}>
                        <IconButton onClick={goToSettings}>
                            <SettingsIcon />
                        </IconButton>
                    </div>
                )}
            </div>

            <DataApprovalList dataSetsConfig={loaderData.dataSetsConfig} />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
    container: { display: "flex" },
    iconContainer: { marginLeft: "auto" },
});

export default MalDataApprovalStatusReport;
