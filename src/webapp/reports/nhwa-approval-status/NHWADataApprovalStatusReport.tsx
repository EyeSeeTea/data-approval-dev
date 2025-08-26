import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";

export const NHWADataApprovalStatusReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("NHWA Data Approval Status Report")}
            </Typography>

            <DataApprovalList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
