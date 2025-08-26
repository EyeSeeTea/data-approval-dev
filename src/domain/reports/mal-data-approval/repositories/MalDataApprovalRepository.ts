import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { MalDataApprovalItem, MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { DataValueStats } from "../../../common/entities/DataValueStats";

export interface MalDataApprovalRepository {
    get(options: MalDataApprovalOptions): Promise<PaginatedObjects<MalDataApprovalItem>>;
    save(filename: string, dataSets: MalDataApprovalItem[]): Promise<void>;
    complete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    approve(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    duplicateDataSets(
        dataSets: MalDataApprovalItemIdentifier[],
        dataElementsWithValues: DataDiffItemIdentifier[]
    ): Promise<boolean>;
    duplicateDataValues(dataSets: DataDiffItemIdentifier[]): Promise<boolean>;
    replicateDataValuesInApvdDataSet(dataSets: DataDiffItemIdentifier[]): Promise<DataValueStats[]>;
    duplicateDataValuesAndRevoke(dataSets: DataDiffItemIdentifier[]): Promise<boolean>;
    incomplete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    unapprove(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    getSortOrder(): Promise<string[]>;
    saveMalDiffNames(dataSetId: string): Promise<void>;
}

export interface MalDataApprovalOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MalDataApprovalItem>;
    periods: string[];
    useOldPeriods?: boolean;
    orgUnitIds: Id[];
    dataSetId: Id;
    approvalStatus?: boolean;
    completionStatus?: boolean;
    isApproved?: boolean;
    modificationCount?: string | undefined;
}
