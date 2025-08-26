import { Config } from "../../../domain/common/entities/Config";
import {
    EARDataSubmissionItem,
    GLASSDataSubmissionItem,
    Module,
    Status,
    getDataSubmissionItemId,
    getEARSubmissionItemId,
} from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";

export interface DataSubmissionViewModel {
    id: string;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
    module: string;
    questionnaireCompleted: boolean;
    dataSetsUploaded: string;
    submissionStatus: string;
}

export interface EARDataSubmissionViewModel {
    creationDate: string;
    id: string;
    module: Module;
    orgUnitId: string;
    orgUnitName: string;
    levelOfConfidentiality: "CONFIDENTIAL" | "NON-CONFIDENTIAL";
    submissionStatus: string;
    status: Status;
}

export function getDataSubmissionViews(_config: Config, items: GLASSDataSubmissionItem[]): DataSubmissionViewModel[] {
    return items.map(item => {
        return {
            id: getDataSubmissionItemId(item),
            orgUnit: item.orgUnit,
            orgUnitName: item.orgUnitName,
            period: item.period,
            status: item.status,
            module: item.module,
            questionnaireCompleted: item.questionnaireCompleted,
            dataSetsUploaded: item.dataSetsUploaded,
            submissionStatus: item.submissionStatus,
            dataSubmissionPeriod: item.dataSubmissionPeriod,
        };
    });
}

export function getEARDataSubmissionViews(
    _config: Config,
    items: EARDataSubmissionItem[]
): EARDataSubmissionViewModel[] {
    return items.map(item => {
        return {
            id: getEARSubmissionItemId(item),
            orgUnitId: item.orgUnit.id,
            orgUnitName: item.orgUnit.name,
            creationDate: item.creationDate,
            status: item.status,
            submissionStatus: item.submissionStatus,
            levelOfConfidentiality: item.levelOfConfidentiality,
            module: item.module,
        };
    });
}
