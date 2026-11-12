import { useCallback, useState } from "react";
import { Cancel } from "../../../../../domain/generic/Future";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../contexts/app-context";
import { getDetailedErrorMessage, getErrorMessage, isMissingTableError } from "../../../../utils/errors";

type ListLoadErrorState = {
    error: string | undefined;
    showLoadError: (err: unknown) => Cancel;
    clearError: () => void;
};

/**
 * The message shown when the list fails to load. A missing table (SqlState 42P01) only means "try
 * again" while an analytics job is running. Otherwise the user sees the real error, with the table
 * name, because retrying will not fix it.
 */
export function useListLoadError(): ListLoadErrorState {
    const { compositionRoot } = useAppContext();
    const [error, setError] = useState<string>();

    const showLoadError = useCallback(
        (err: unknown): Cancel => {
            if (!isMissingTableError(err)) {
                setError(getListLoadErrorMessage(err, false));
                return undefined;
            }

            return compositionRoot.analyticsJobs.getRunning.execute().run(
                runningJobs => setError(getListLoadErrorMessage(err, runningJobs.length > 0)),
                () => setError(getListLoadErrorMessage(err, false))
            );
        },
        [compositionRoot]
    );

    const clearError = useCallback(() => setError(undefined), []);

    return { error, showLoadError, clearError };
}

export function getListLoadErrorMessage(err: unknown, isAnalyticsRunning: boolean): string {
    if (!isMissingTableError(err)) return getLoadErrorMessage(getErrorMessage(err));

    return isAnalyticsRunning ? getAnalyticsRunningMessage() : getLoadErrorMessage(getDetailedErrorMessage(err));
}

function getLoadErrorMessage(message: string): string {
    return i18n.t("The list could not be loaded. {{message}}", {
        message: message,
        interpolation: { escapeValue: false },
    });
}

function getAnalyticsRunningMessage(): string {
    return i18n.t(
        "The list could not be loaded because analytics jobs are currently running. Please try again in a few seconds by clicking 'Apply Filters'."
    );
}
