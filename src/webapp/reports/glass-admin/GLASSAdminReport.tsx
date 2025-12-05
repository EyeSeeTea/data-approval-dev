import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import GLASSHeader from "../../components/headers/glass-data-submission/index";
import React from "react";
import { DataMaintenanceList } from "./glass-admin-list/DataMaintenanceList";

const GLASSAdminReport: React.FC = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <GLASSHeader />
            <div className={classes.wrapper}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("GLASS Admin Maintenance Report")}
                </Typography>

                <DataMaintenanceList />
            </div>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default GLASSAdminReport;
