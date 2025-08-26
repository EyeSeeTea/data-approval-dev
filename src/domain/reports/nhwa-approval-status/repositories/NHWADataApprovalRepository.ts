import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataApprovalItem, DataApprovalItemIdentifier } from "../entities/DataApprovalItem";

export interface NHWADataApprovalRepository {
    get(options: NHWADataApprovalRepositoryGetOptions): Promise<PaginatedObjects<DataApprovalItem>>;
    save(filename: string, dataSets: DataApprovalItem[]): Promise<void>;
    complete(dataSets: DataApprovalItemIdentifier[]): Promise<boolean>;
    approve(dataSets: DataApprovalItemIdentifier[]): Promise<boolean>;
    incomplete(dataSets: DataApprovalItemIdentifier[]): Promise<boolean>;
    unapprove(dataSets: DataApprovalItemIdentifier[]): Promise<boolean>;
    getColumns(): Promise<string[]>;
    saveColumns(columns: string[]): Promise<void>;
}

export interface NHWADataApprovalRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataApprovalItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    approvalStatus?: string;
    completionStatus?: string;
}
