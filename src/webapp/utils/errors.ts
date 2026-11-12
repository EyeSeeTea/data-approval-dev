import _ from "../../domain/generic/Collection";

export function getErrorMessage(err: unknown): string {
    return joinMessages([getMessage(err), getResponseField(err, "message")]);
}

/** Like getErrorMessage, plus DHIS2's devMessage: for a SQL error, the PostgreSQL error that names the table. */
export function getDetailedErrorMessage(err: unknown): string {
    return joinMessages([getMessage(err), getResponseField(err, "message"), getResponseField(err, "devMessage")]);
}

// DHIS2 answers 409 with SqlState 42P01 when a query reads a table that does not exist, whichever
// table it is. That can mean the analytics job is rebuilding the tables, or that a SQL view still
// reads a table that was dropped, so this check alone does not say which.
export function isMissingTableError(err: unknown): boolean {
    if (!isRecord(err) || !isRecord(err.response) || err.response.status !== 409) return false;
    const message = getResponseField(err, "message") ?? "";
    return message.includes("42P01") || message.includes("referenced table does not exist");
}

function getMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

function getResponseField(err: unknown, field: "message" | "devMessage"): string | undefined {
    if (!isRecord(err) || !isRecord(err.response) || !isRecord(err.response.data)) return undefined;
    const value = err.response.data[field];
    return typeof value === "string" ? value : undefined;
}

function joinMessages(parts: ReadonlyArray<string | undefined>): string {
    return _([...parts])
        .compactMap(part => part || undefined)
        .join(" - ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
