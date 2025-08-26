import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { CSYSummaryList } from "./csy-summary-mortality-list/CSYSummaryList";

const CSYSummaryReportMortality: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("CSY Summary Report - Mortality by Injury Severity")}
            </Typography>

            <CSYSummaryList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default CSYSummaryReportMortality;
