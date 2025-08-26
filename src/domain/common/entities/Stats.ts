import { Id } from "./Base";

export type Stats = {
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    errorMessages: StatsError[];
};

type StatsError = { id: Id; message: string };
