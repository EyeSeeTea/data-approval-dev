import _ from "lodash";
import { D2Api, Id, Pager, CancelableResponse } from "../../types/d2-api";

export class Dhis2SqlViews {
    constructor(private api: D2Api) {}

    query<Variables extends {}, Field extends string>(
        id: Id,
        variables?: Variables,
        paging?: SqlViewPaging
    ): CancelableResponse<SqlViewGetData<Field>> {
        /*
        Example:

            GET /api/sqlViews/ID/data
                    ?var=orgUnitId:H8RixfF8ugH
                    ?var=period:2018
                    &pageSize=10
                    &page=2
                    &fields=id,name
                    &filter=name:like:abc
        */
        const variableParams = _(variables)
            .toPairs()
            .map(([key, value]) => `${key}:${value}`)
            .value();
        const params = { var: variableParams, ...paging };

        return this.api.get<SqlViewDataResponse<Field>>(`/sqlViews/${id}/data`, params).map(({ data }) => {
            const columns = data.listGrid.headers.map(header => header.column);
            const rows = data.listGrid.rows.map(row => _.zipObject(columns, row) as Record<Field, string>);
            return { pager: data.pager, rows };
        });
    }
}

export interface SqlViewPaging {
    page?: number;
    pageSize?: number;
}

export interface SqlViewGetData<Field extends string> {
    pager: Pager;
    rows: Array<Record<Field, string>>;
}

export interface SqlViewDataResponse<Field extends string> {
    pager: Pager;
    listGrid: {
        metaData: {};
        headerWidth: number;
        width: number;
        title: string;
        height: number;
        headers: SqlViewDataHeader<Field>[];
        rows: Row[];
    };
}

export type Row = string[];

export interface SqlViewDataHeader<Field extends string> {
    hidden: boolean;
    meta: boolean;
    name: string;
    column: Field;
    type: string;
}
