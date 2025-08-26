import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import React from "react";
import { CSYSummaryList } from "./csy-summary-list/CSYSummaryList";

const CSYSummaryReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("CSY Summary Report - Patient Characteristics")}
            </Typography>

            <CSYSummaryList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default CSYSummaryReport;
