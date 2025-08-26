import { Code, Id } from "./Base";

export type AppSettings = {
    dataSets: Record<Code, DataSetSettings>;
};

export type DataSetSettings = {
    dataSourceId: Id;
    oldDataSourceId: Id;
    dataElements: DataElementSettings;
    approvalDataSetCode: Code;
};

export type DataElementSettings = {
    submissionDate: Code;
    approvalDate: Code;
};

export const DATA_ELEMENT_SUFFIX = "-APVD";

export function isValidApprovalDataElement(originalName: string, apvdName: string) {
    return `${originalName}${DATA_ELEMENT_SUFFIX}`.toLocaleLowerCase() === apvdName.toLocaleLowerCase();
}
