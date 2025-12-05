import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { TwoFactorMonitorList } from "./two-factor-list/TwoFactorList";

export const TwoFactorMonitoringReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("User Two Factor Monitoring")}
            </Typography>

            <TwoFactorMonitorList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
