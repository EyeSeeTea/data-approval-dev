import { isAnalyticsTableMissingError } from "../errors";

function responseError(status: number, message: string) {
    return Object.assign(new Error(`Request failed with status code ${status}`), {
        response: { status, data: { httpStatusCode: status, status: "ERROR", message } },
    });
}

describe("isAnalyticsTableMissingError", () => {
    it("recognizes the 409 DHIS2 returns while analytics tables are missing", () => {
        const err = responseError(
            409,
            "Query failed because a referenced table does not exist. Please ensure analytics job was run (SqlState: 42P01)"
        );
        expect(isAnalyticsTableMissingError(err)).toBe(true);
    });

    it("ignores other 409 errors", () => {
        expect(isAnalyticsTableMissingError(responseError(409, "Query failed because of a syntax error"))).toBe(false);
    });

    it("ignores the same message with another status", () => {
        expect(isAnalyticsTableMissingError(responseError(500, "SqlState: 42P01"))).toBe(false);
    });

    it("ignores errors without a response", () => {
        expect(isAnalyticsTableMissingError(new Error("Network Error"))).toBe(false);
        expect(isAnalyticsTableMissingError(undefined)).toBe(false);
    });
});
