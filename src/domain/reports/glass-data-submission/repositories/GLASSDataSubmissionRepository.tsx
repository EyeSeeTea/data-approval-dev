import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    DataSubmissionPeriod,
    EARDataSubmissionItem,
    EARSubmissionItemIdentifier,
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    GLASSDataSubmissionModule,
    Module,
    Status,
} from "../entities/GLASSDataSubmissionItem";
import { OrgUnitWithChildren } from "../entities/OrgUnit";

export interface GLASSDataSubmissionRepository {
    get(options: GLASSDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<GLASSDataSubmissionItem>>;
    getUserModules(config: Config): Promise<GLASSDataSubmissionModule[]>;
    getEAR(options: EARDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<EARDataSubmissionItem>>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    dhis2MessageCount(): Promise<number>;
    approve(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        signals?: EARSubmissionItemIdentifier[]
    ): Promise<void>;
    reject(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        message?: string,
        isDatasetUpdate?: boolean,
        signals?: EARSubmissionItemIdentifier[]
    ): Promise<void>;
    reopen(namespace: string, items: GLASSDataSubmissionItemIdentifier[]): Promise<void>;
    accept(namespace: string, items: GLASSDataSubmissionItemIdentifier[]): Promise<void>;
    getGLASSDashboardId(): Promise<string>;
    getOrganisationUnitsWithChildren(): Promise<OrgUnitWithChildren[]>;
}

export interface GLASSDataSubmissionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<GLASSDataSubmissionItem>;
    periods: string[];
    quarters: string[];
    module: Module | undefined;
    orgUnitIds: Id[];
    dataSubmissionPeriod: DataSubmissionPeriod;
    completionStatus?: boolean;
    submissionStatus?: Status;
}

export interface EARDataSubmissionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<EARDataSubmissionItem>;
    module: Module | undefined;
    orgUnitIds: Id[];
    from: Date | undefined;
    to: Date | undefined;
    submissionStatus?: Status;
}
