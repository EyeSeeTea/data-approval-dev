import React from "react";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { getErrorMessage } from "./errors";

export function useSnackbarOnError<T, Args extends any[]>(fn: (...args: Args) => Promise<T>) {
    const snackbar = useSnackbar();

    return React.useCallback(
        async (...args: Args) => {
            try {
                return await fn(...args);
            } catch (err) {
                console.error(err);
                snackbar.error(getErrorMessage(err));
                return undefined;
            }
        },
        [fn, snackbar]
    );
}
