import { Id } from "../../../common/entities/Base";

export type AutoCompleteComputeSettings = {
    dataSet: Id;
    dataElements: DataElementTotal[];
};

export type DataElementTotal = {
    dataElementTotal: Id;
    categoryOptionCombo: Id;
    children: DataElementChildren[];
};

export type DataElementChildren = {
    dataElement: Id;
};
