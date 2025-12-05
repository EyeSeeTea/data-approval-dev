import { Id, NamedRef, Named } from "../../../common/entities/Base";

export interface DataCommentsItem {
    period: string;
    orgUnit: Named;
    dataSet: Named;
    dataElement: NamedRef;
    section: string;
    categoryOptionCombo: Named;
    value: string;
    comment: string;
    lastUpdated: Date;
    storedBy: string;
}

export function getDataCommentsItemId(dataValue: DataCommentsItem): Id {
    return [dataValue.dataElement, dataValue.period, dataValue.categoryOptionCombo].join("-");
}
