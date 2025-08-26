import { AppSettings } from "../domain/common/entities/AppSettings";
import { Code } from "../domain/common/entities/Base";

const nhwaDataCapture1 = "NHWA _DATA Capture Module 1";
const nhwaDataCapture2 = "NHWA _DATA Capture Module 2-4";
const nhwaAdmin = "NHWA administrators";

export const approvalReportAccess: D2ApprovalReportAccess = {
    dataSets: {
        "NHWA-M1-2023": {
            complete: { userGroups: [nhwaAdmin], users: [] },
            incomplete: { userGroups: [nhwaAdmin], users: [] },
            monitoring: { userGroups: [nhwaAdmin], users: [] },
            read: { userGroups: [nhwaAdmin, nhwaDataCapture1], users: [] },
            revoke: { userGroups: [nhwaAdmin, nhwaDataCapture1], users: [] },
            submit: { userGroups: [nhwaAdmin, nhwaDataCapture1], users: [] },
            approve: { userGroups: [nhwaAdmin], users: [] },
        },
        "NHWA-M2-2023": {
            complete: { userGroups: [nhwaAdmin], users: [] },
            incomplete: { userGroups: [nhwaAdmin], users: [] },
            monitoring: { userGroups: [nhwaAdmin], users: [] },
            read: { userGroups: [nhwaAdmin, nhwaDataCapture2], users: [] },
            revoke: { userGroups: [nhwaAdmin, nhwaDataCapture2], users: [] },
            submit: { userGroups: [nhwaAdmin, nhwaDataCapture2], users: [] },
            approve: { userGroups: [nhwaAdmin], users: [] },
        },
    },
};

export const approvalReportSettings: AppSettings = {
    dataSets: {
        "NHWA-M1-2023": {
            dataSourceId: "hvvqvHV6jIq",
            oldDataSourceId: "hvvqvHV6jIq",
            approvalDataSetCode: "NHWA-M1-2023-APVD",
            dataElements: {
                approvalDate: "NHWA_APPROVAL_DATE_MODULE1-APVD",
                submissionDate: "NHWA_SUBMISSION_DATE_MODULE1-APVD",
            },
        },
        "NHWA-M2-2023": {
            dataSourceId: "h8TOj5HtMM8",
            oldDataSourceId: "h8TOj5HtMM8",
            approvalDataSetCode: "NHWA-M2-2023-APVD",
            dataElements: {
                approvalDate: "NHWA_APPROVAL_DATE_MODULE2-APVD",
                submissionDate: "NHWA_SUBMISSION_DATE_MODULE2-APVD",
            },
        },
    },
};

type D2ApprovalReportAccess = Record<"dataSets", D2ApprovalAccessDataSets>;

type D2ApprovalAccessDataSets = Record<
    Code,
    {
        complete: AccessSettings;
        incomplete: AccessSettings;
        monitoring: AccessSettings;
        read: AccessSettings;
        revoke: AccessSettings;
        submit: AccessSettings;
        approve: AccessSettings;
    }
>;

type AccessSettings = {
    userGroups: Code[];
    users: Code[];
};
