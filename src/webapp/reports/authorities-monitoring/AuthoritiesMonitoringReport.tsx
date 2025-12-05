import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import React from "react";
import { AuthoritiesMonitoringList } from "./authorities-monitoring-list/AuthoritiesMonitoringList";

const AuthoritiesMonitoringReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("WIDP Admin Templates Report")}
            </Typography>
            <p>{i18n.t("List of users with not allowed roles")}</p>

            <AuthoritiesMonitoringList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default AuthoritiesMonitoringReport;
