import { getDetailedErrorMessage, getErrorMessage, isMissingTableError } from "../errors";
import { missingTableDevMessage, missingTableMessage, responseError } from "./responseErrors";

describe("isMissingTableError", () => {
    it("recognizes the 409 DHIS2 returns when a referenced table does not exist", () => {
        expect(isMissingTableError(responseError(409, missingTableMessage))).toBe(true);
    });

    it("ignores other 409 errors", () => {
        expect(isMissingTableError(responseError(409, "Query failed because of a syntax error"))).toBe(false);
    });

    it("ignores the same message with another status", () => {
        expect(isMissingTableError(responseError(500, "SqlState: 42P01"))).toBe(false);
    });

    it("ignores errors without a response", () => {
        expect(isMissingTableError(new Error("Network Error"))).toBe(false);
        expect(isMissingTableError(undefined)).toBe(false);
    });
});

describe("error messages", () => {
    const err = responseError(409, missingTableMessage, missingTableDevMessage);

    it("leaves the devMessage out of the regular message", () => {
        expect(getErrorMessage(err)).toBe(`Request failed with status code 409 - ${missingTableMessage}`);
    });

    it("adds the devMessage, which names the missing table, to the detailed message", () => {
        expect(getDetailedErrorMessage(err)).toBe(
            `Request failed with status code 409 - ${missingTableMessage} - ${missingTableDevMessage}`
        );
    });

    it("gives the same detailed message as the regular one when there is no devMessage", () => {
        expect(getDetailedErrorMessage(new Error("Network Error"))).toBe("Network Error");
    });
});
