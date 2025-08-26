import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { CSYAuditEmergencyList } from "./csy-audit-emergency-list/CSYAuditEmergencyList";

const CSYAuditEmergencyReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("CSY Audit Filters - Emergency Care")}
            </Typography>

            <CSYAuditEmergencyList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default CSYAuditEmergencyReport;
