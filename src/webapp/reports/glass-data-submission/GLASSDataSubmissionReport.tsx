import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataSubmissionList } from "./glass-data-submission-list/DataSubmissionList";
import GLASSHeader from "../../components/headers/glass-data-submission/index";
import React from "react";

const GLASSDataSubmissionReport: React.FC = () => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <GLASSHeader />
            <div className={classes.wrapper}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("GLASS Data Submission Report")}
                </Typography>

                <DataSubmissionList />
            </div>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default GLASSDataSubmissionReport;
