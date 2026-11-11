import _ from "lodash";
import { ReactNode } from "react";
import { TableColumn, TableSorting } from "@eyeseetea/d2-ui-components";

type Row = { id: string };

export function sortRows<T extends Row>(rows: T[], columns: TableColumn<T>[], sorting: TableSorting<T>): T[] {
    const column = columns.find(({ name }) => name === sorting.field);
    const getValue = column?.getValue;

    const sortKey = (row: T) => comparableValue(getValue ? getValue(row, undefined) : row[sorting.field]);

    return _.orderBy(rows, [sortKey], [sorting.order]);
}

function comparableValue(value: ReactNode | unknown): string | number {
    if (typeof value === "number") return value;
    if (value instanceof Date) return value.getTime();
    if (value === undefined || value === null || typeof value === "boolean") return "";

    const text = String(value);
    const asNumber = Number(text);

    return text.trim() !== "" && Number.isFinite(asNumber) ? asNumber : text.toLowerCase();
}
