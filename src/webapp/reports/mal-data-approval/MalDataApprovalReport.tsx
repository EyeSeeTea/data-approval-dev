import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";
import { IconButton } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { useLoaderData, useNavigate } from "react-router-dom";
import { DataSetConfigLoader } from "../Reports";
import { NavLink } from "react-router-dom";

const MalDataApprovalStatusReport: React.FC = () => {
    const { config } = useAppContext();
    // TODO: update to react-router v7 which has better types support
    const loaderData = useLoaderData() as DataSetConfigLoader;
    const navigate = useNavigate();
    const classes = useStyles();

    const goToSettings = () => {
        navigate("/datasets-settings/list");
    };

    const isAdmin = config.currentUser.isAdmin;

    return (
        <div className={classes.wrapper}>
            <div className={classes.container}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("Data Approval Report")}
                </Typography>

                {isAdmin && (
                    <div className={classes.iconContainer}>
                        <IconButton onClick={goToSettings}>
                            <SettingsIcon />
                        </IconButton>
                    </div>
                )}
            </div>

            {loaderData.dataSetsConfig.length === 0 && (
                <div>
                    <Typography color="error" style={{ marginLeft: 20 }}>
                        {i18n.t("No dataSets configuration found.")}
                    </Typography>
                    {isAdmin && (
                        <NavLink to="/datasets-settings/list" style={{ marginLeft: 20 }}>
                            {i18n.t("Please setup dataSet configurations here.")}
                        </NavLink>
                    )}
                </div>
            )}

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
