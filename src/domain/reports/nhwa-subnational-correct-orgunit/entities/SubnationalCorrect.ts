import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { OrgUnit } from "../../../common/entities/OrgUnit";

export type SubnationalCorrectWithPaging = {
    page: number;
    pageCount: number;
    total: number;
    pageSize: number;
    rows: SubnationalCorrect[];
};

export type SubnationalCorrect = {
    id: string;
    orgUnitParent: Pick<OrgUnit, "name">;
    orgUnit: Pick<OrgUnit, "id" | "name">;
    period: string;
    nameToFix: string;
    categoryOptionCombo: string;
    dataElement: string;
};

export type SubnationalCorrectOptions = {
    cacheKey: string;
    page: number;
    pageSize: number;
    sortingField: string;
    sortingOrder: "asc" | "desc";
    filters: {
        periods: string[];
        orgUnits: string[];
    };
    config: Config;
};

export type SubnationalCorrectSettings = {
    subnationalDataSet: Id;
};
