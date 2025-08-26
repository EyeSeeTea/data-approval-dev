type DataValueStatsAttrs = {
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    period: string;
    orgUnitId: string;
    dataSetId: string;
    errorMessages: { message: string }[];
    strategy: "SAVE" | "DELETE";
};

export class DataValueStats {
    public readonly imported: number;
    public readonly updated: number;
    public readonly ignored: number;
    public readonly deleted: number;
    public readonly errorMessages: { message: string }[];
    public readonly period: string;
    public readonly orgUnitId: string;
    public readonly dataSetId: string;
    public readonly strategy: "SAVE" | "DELETE";

    constructor(attrs: DataValueStatsAttrs) {
        this.imported = attrs.imported;
        this.updated = attrs.updated;
        this.ignored = attrs.ignored;
        this.deleted = attrs.deleted;
        this.period = attrs.period;
        this.orgUnitId = attrs.orgUnitId;
        this.dataSetId = attrs.dataSetId;
        this.errorMessages = (attrs.errorMessages || []).map(error => ({
            message: error.message,
        }));
        this.strategy = attrs.strategy;
    }
}
