import _ from "../../domain/generic/Collection";

export function getErrorMessage(err: unknown): string {
    const message = err instanceof Error ? err.message : String(err);

    return _([message, getResponseMessage(err)])
        .compactMap(part => part || undefined)
        .join(" - ");
}

function getResponseMessage(err: unknown): string | undefined {
    if (!isRecord(err) || !isRecord(err.response) || !isRecord(err.response.data)) return undefined;
    const { message } = err.response.data;
    return typeof message === "string" ? message : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
