import { getListLoadErrorMessage } from "../useListLoadError";
import {
    missingTableDevMessage,
    missingTableMessage,
    responseError,
} from "../../../../../utils/__tests__/responseErrors";

const analyticsRunningMessage =
    "The list could not be loaded because analytics jobs are currently running. Please try again in a few seconds by clicking 'Apply Filters'.";

describe("getListLoadErrorMessage", () => {
    describe("missing table (SqlState 42P01)", () => {
        const err = responseError(409, missingTableMessage, missingTableDevMessage);

        it("asks the user to try again while an analytics job is running", () => {
            expect(getListLoadErrorMessage(err, true)).toBe(analyticsRunningMessage);
        });

        it("shows the real error with the missing table when no analytics job is running", () => {
            expect(getListLoadErrorMessage(err, false)).toBe(
                `The list could not be loaded. Request failed with status code 409 - ${missingTableMessage} - ${missingTableDevMessage}`
            );
        });
    });

    describe("other errors", () => {
        it("shows the server message, without the devMessage", () => {
            const err = responseError(409, "Query failed because of a syntax error", "ERROR: syntax error");

            expect(getListLoadErrorMessage(err, false)).toBe(
                "The list could not be loaded. Request failed with status code 409 - Query failed because of a syntax error"
            );
        });
    });
});
