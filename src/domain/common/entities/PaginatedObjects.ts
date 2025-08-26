import _ from "lodash";

export interface PaginatedObjects<T> {
    pager: Pager;
    objects: T[];
}

export interface Pager {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
}

export interface Paging {
    page: number;
    pageSize: number;
}

export interface Sorting<T> {
    field: keyof T;
    direction: "asc" | "desc";
}

export const emptyPage = { pager: { page: 1, pageCount: 1, pageSize: 20, total: 1 }, objects: [] };

export function getPaginatedObjects<T>(rows: T[], paging: Paging, sorting: Sorting<T> | undefined): T[] {
    const rowsInPage = _(rows)
        .drop((paging.page - 1) * paging.pageSize)
        .take(paging.pageSize)
        .value();

    if (!sorting) return rowsInPage;
    return _.orderBy(rowsInPage, sorting.field, sorting.direction);
}

export function getPager<T>(rows: T[], paging: Paging): Pager {
    return {
        page: paging.page,
        pageSize: paging.pageSize,
        pageCount: Math.ceil(rows.length / paging.pageSize),
        total: rows.length,
    };
}

export function paginate<T>(objects: T[], paging: Paging, sorting?: Sorting<T>) {
    const pager = getPager(objects, paging);
    const paginatedObjects = getPaginatedObjects(objects, paging, sorting);

    return { pager, objects: paginatedObjects };
}
