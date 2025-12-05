import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { CSYAuditTraumaList } from "./csy-audit-trauma-list/CSYAuditTraumaList";

const CSYAuditTraumaReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("CSY Audit Filters - Trauma Care")}
            </Typography>

            <CSYAuditTraumaList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default CSYAuditTraumaReport;
