import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { MetadataObjectsWithInvalidSSList } from "./metadata-list/MetadataObjectsWithInvalidSSList";
import { MetadataPublicObjectsList } from "./metadata-list/MetadataPublicObjectsList";

export const AdminReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Metadata Admin Report")}
            </Typography>

            <Typography variant="h6" gutterBottom>
                {i18n.t("Objects with invalid sharing settings")}
            </Typography>
            <MetadataObjectsWithInvalidSSList />

            <Typography variant="h6" gutterBottom>
                {i18n.t("Public Objects")}
            </Typography>
            <MetadataPublicObjectsList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});
