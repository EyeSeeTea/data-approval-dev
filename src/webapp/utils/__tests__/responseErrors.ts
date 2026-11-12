export const missingTableMessage =
    "Query failed because a referenced table does not exist. Please ensure analytics job was run (SqlState: 42P01)";

export const missingTableDevMessage = 'ERROR: relation "_orgunitstructure" does not exist';

/** An error shaped like the one d2-api throws for a DHIS2 web message response. */
export function responseError(status: number, message: string, devMessage?: string) {
    return Object.assign(new Error(`Request failed with status code ${status}`), {
        response: { status, data: { httpStatusCode: status, status: "ERROR", message, devMessage } },
    });
}
