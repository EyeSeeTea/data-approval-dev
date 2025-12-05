import { Id } from "../../../common/entities/Base";

export type FixTotalSettings = {
    dataSet: Id;
    dataElements: DataElementActivityLevel[];
    excludeTotalDataElements: Id[];
};

export type DataElementActivityLevel = {
    licensedToPractise: {
        cocId: Id;
        id: Id;
    };
    practising: {
        cocId: Id;
        id: Id;
    };
    professionallyActive: {
        cocId: Id;
        id: Id;
    };
    total: {
        cocId: Id;
        id: Id;
    };
};
