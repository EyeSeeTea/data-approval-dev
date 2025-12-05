import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataSubscriptionList } from "./data-subscription-list/DataSubscriptionList";

const MalDataSubscriptionStatusReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Malaria Data Subscription Report")}
            </Typography>

            <DataSubscriptionList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default MalDataSubscriptionStatusReport;
