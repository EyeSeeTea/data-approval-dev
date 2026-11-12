import _ from "../../domain/generic/Collection";

export function getErrorMessage(err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);

    return _([message, getResponseMessage(err)])
        .compactMap(part => part || undefined)
        .join(" - ");
}

// DHIS2 answers a SQL view query with 409 and SqlState 42P01 when the analytics tables the view
// reads do not exist. That happens while the analytics job is rebuilding them, so for the user
// this means "try again in a moment", not a failure worth showing in raw form.
export function isAnalyticsTableMissingError(err: unknown): boolean {
    if (!isRecord(err) || !isRecord(err.response) || err.response.status !== 409) return false;
    const message = getResponseMessage(err) ?? "";
    return message.includes("42P01") || message.includes("referenced table does not exist");
}

function getResponseMessage(err: unknown): string | undefined {
    if (!isRecord(err) || !isRecord(err.response) || !isRecord(err.response.data)) return undefined;
    const { message } = err.response.data;
    return typeof message === "string" ? message : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
