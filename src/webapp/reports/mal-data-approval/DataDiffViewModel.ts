import { DataDiffItem, getDataDiffItemId } from "../../../domain/reports/mal-data-approval/entities/DataDiffItem";

export interface DataDiffViewModel {
    id: string;
    dataSetUid: string;
    orgUnitUid: string;
    period: string;
    value: string | undefined;
    apvdValue: string | undefined;
    dataElement: string | undefined;
    apvdDataElement: string | undefined;
    comment: string | undefined;
    apvdComment: string | undefined;
}

export function getDataDiffViews(items: DataDiffItem[]): DataDiffViewModel[] {
    return items.map(item => {
        return {
            id: getDataDiffItemId(item),
            dataSetUid: item.dataSetUid,
            orgUnitUid: item.orgUnitUid,
            period: item.period,
            value: item.value,
            apvdValue: item.apvdValue,
            dataElement: item.dataElement,
            apvdDataElement: item.apvdDataElement,
            comment: item.comment,
            apvdComment: item.apvdComment,
        };
    });
}
