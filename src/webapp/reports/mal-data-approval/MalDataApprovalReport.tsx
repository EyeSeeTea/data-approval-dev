import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";

const MalDataApprovalStatusReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Data Approval Report")}
            </Typography>

            <DataApprovalList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default MalDataApprovalStatusReport;
