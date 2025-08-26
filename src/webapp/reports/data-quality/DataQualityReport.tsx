import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataQualityList } from "./DataQualityList";

const DataQualityReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Data quality")}
            </Typography>

            <DataQualityList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default DataQualityReport;
