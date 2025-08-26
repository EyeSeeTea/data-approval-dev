import { Chip, withStyles } from "@material-ui/core";
import { ExitToApp, Home, MailOutline } from "@material-ui/icons";
import PropTypes from "prop-types";
import i18n from "../../../../locales";
import { styles } from "./styles";
import { useEffect, useState } from "react";
import { useAppContext } from "../../../contexts/app-context";
import { goToDhis2Url } from "../../../../utils/utils";

const GLASSHeader = ({ classes }) => {
    const { api, compositionRoot } = useAppContext();
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        compositionRoot.glassDataSubmission
            .dhis2MessageCount()
            .then(notifications => setNotificationCount(notifications));
    }, [compositionRoot]);

    const baseUrl = api.baseUrl;
    const actionLogout = () => goToDhis2Url(baseUrl, "/dhis-web-commons-security/logout.action");
    const actionMessaging = () => goToDhis2Url(baseUrl, "/dhis-web-messaging");
    const actionLandingPage = () => goToDhis2Url(baseUrl, "/api/apps/Home-Page/index.html#/glass-hq");

    return (
        <header className={classes.container}>
            <div className={classes.titleContainer}>
                <Home className={classes.title} fontSize="large" onClick={actionLandingPage} />
                <img className={classes.logo} alt={"glass-logo"} src="img/glass.png" />
                <img className={classes.logo} alt={"who-logo"} src="img/who-logo.png" />
            </div>
            <div className={classes.titleContainer}>
                <div className={classes.messages}>
                    <MailOutline className={classes.title} onClick={actionMessaging} />
                    <span className={classes.messageCount}>{notificationCount}</span>
                </div>
                <Chip
                    icon={<ExitToApp className={classes.exitIcon} />}
                    label={i18n.t("LOG OUT")}
                    className={classes.logout}
                    onClick={actionLogout}
                />
            </div>
        </header>
    );
};

GLASSHeader.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GLASSHeader);
