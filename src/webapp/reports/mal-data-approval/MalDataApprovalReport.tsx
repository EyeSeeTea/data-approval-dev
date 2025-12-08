import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";
import { IconButton } from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { useNavigate } from "react-router-dom";

const MalDataApprovalStatusReport: React.FC = () => {
    const { config } = useAppContext();
    const navigate = useNavigate();
    const classes = useStyles();

    const goToSettings = () => {
        navigate("/datasets-settings/list");
    };

    return (
        <div className={classes.wrapper}>
            <div style={{ display: "flex" }}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("Data Approval Report")}
                </Typography>

                {config.currentUser.isAdmin && (
                    <div style={{ marginLeft: "auto" }}>
                        <IconButton onClick={goToSettings}>
                            <SettingsIcon />
                        </IconButton>
                    </div>
                )}
            </div>

            <DataApprovalList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default MalDataApprovalStatusReport;
