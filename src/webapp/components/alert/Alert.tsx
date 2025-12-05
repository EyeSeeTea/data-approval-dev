import React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/ErrorOutline";

type AlertProps = { message: string };

export const Alert: React.FC<AlertProps> = props => {
    const { message } = props;
    const classes = useStyles();
    return (
        <div className={classes.alertContainer}>
            <ErrorIcon htmlColor="#f44336" />
            <Typography variant="body1" component="p">
                {message}
            </Typography>
        </div>
    );
};

const useStyles = makeStyles({
    alertContainer: {
        alignItems: "center",
        backgroundColor: "rgb(253, 236, 234)",
        color: "rgb(97, 26, 21)",
        display: "flex",
        gap: "1em",
        padding: "0.5em 1em",
    },
});
