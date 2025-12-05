import { Code, Id } from "./Base";
import { OrgUnit } from "./OrgUnit";

export type DataSet = {
    id: Id;
    code: Code;
    name: string;
    organisationUnits: OrgUnit[];
    dataElements: DataElement[];
};

export type DataElement = {
    id: Id;
    name: string;
    originalName: string;
    code: string;
    categoryCombo: CategoryCombo;
};

type CategoryCombo = {
    id: Id;
    name: string;
    code: string;
    categoryOptionCombos: CategoryOptionCombo[];
};

export type CategoryOptionCombo = {
    id: Id;
    name: string;
    code: string;
};
