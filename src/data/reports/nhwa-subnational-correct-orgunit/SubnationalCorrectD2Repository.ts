import { D2Api } from "../../../types/d2-api";
import { SubnationalCorrectRepository } from "../../../domain/reports/nhwa-subnational-correct-orgunit/repositories/SubnationalCorrectRepository";
import { Dhis2SqlViews } from "../../common/Dhis2SqlViews";
import { getSqlViewId } from "../../../domain/common/entities/Config";
import { SQL_VIEW_NHWA_SUBNATIONAL_CORRECT } from "../../common/Dhis2ConfigRepository";
import {
    SubnationalCorrectOptions,
    SubnationalCorrectWithPaging,
} from "../../../domain/reports/nhwa-subnational-correct-orgunit/entities/SubnationalCorrect";

type SqlField =
    | "dataSet"
    | "orgunitparent"
    | "period"
    | "orgunit"
    | "value"
    | "dataelement"
    | "categoryoptioncombo"
    | "orgunitname";

export class SubnationalCorrectD2Repository implements SubnationalCorrectRepository {
    constructor(private api: D2Api) {}

    async get(options: SubnationalCorrectOptions): Promise<SubnationalCorrectWithPaging> {
        const { config } = options;
        const sqlViews = new Dhis2SqlViews(this.api);
        const { pager, rows } = await sqlViews
            .query<{}, SqlField>(getSqlViewId(config, SQL_VIEW_NHWA_SUBNATIONAL_CORRECT), undefined, {
                page: options.page,
                pageSize: options.pageSize,
            })
            .getData();

        const subnationalCorrectRecords = rows.map(row => {
            return {
                id: `${row.orgunitparent}.${row.orgunit}.${row.period}.${row.dataelement}.${row.categoryoptioncombo}`,
                nameToFix: row.value,
                orgUnit: {
                    id: row.orgunit,
                    name: row.orgunitname,
                },
                orgUnitParent: {
                    name: row.orgunitparent,
                },
                dataElement: row.dataelement,
                categoryOptionCombo: row.categoryoptioncombo,
                period: row.period,
            };
        });

        return { ...pager, rows: subnationalCorrectRecords };
    }
}
