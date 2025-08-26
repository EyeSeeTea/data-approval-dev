export interface DataDiffItem {
    dataSetUid: string;
    orgUnitUid: string;
    period: string;
    value: string | undefined;
    apvdValue: string | undefined;
    dataElement: string | undefined;
    apvdDataElement: string | undefined;
    comment: string | undefined;
    apvdComment: string | undefined;
    attributeOptionCombo: string | undefined;
    categoryOptionCombo: string | undefined;
    dataElementBasicName: string | undefined;
}

export interface DataDiffItemIdentifier {
    dataSet: string;
    orgUnit: string;
    period: string;
    dataElement: string;
    value: string;
    apvdValue: string;
    comment?: string;
    attributeOptionCombo: string | undefined;
    categoryOptionCombo: string | undefined;
    dataElementBasicName: string | undefined;
}

export function getDataDiffItemId(item: DataDiffItem): string {
    return [
        item.dataSetUid,
        item.period,
        item.orgUnitUid,
        item.dataElement,
        item.value,
        item.apvdValue,
        item.comment,
        item.attributeOptionCombo,
        item.categoryOptionCombo,
        item.dataElementBasicName,
    ].join("|||");
}

export function parseDataDiffItemId(string: string): DataDiffItemIdentifier | undefined {
    const [
        dataSet,
        period,
        orgUnit,
        dataElement,
        value = "",
        apvdValue = "",
        comment,
        attributeOptionCombo,
        categoryOptionCombo,
        dataElementBasicName,
    ] = string.split("|||");

    if (!dataSet || !period || !orgUnit || !dataElement) return undefined;

    return {
        dataSet,
        period,
        orgUnit,
        dataElement,
        value,
        apvdValue,
        comment,
        attributeOptionCombo: attributeOptionCombo,
        categoryOptionCombo: categoryOptionCombo,
        dataElementBasicName: dataElementBasicName,
    };
}
