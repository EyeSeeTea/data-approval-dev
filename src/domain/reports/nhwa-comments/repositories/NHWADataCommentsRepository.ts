import { DataCommentsItem } from "../entities/DataCommentsItem";
import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";

export interface NHWADataCommentsRepository {
    get(options: NHWADataCommentsRepositoryGetOptions): Promise<PaginatedObjects<DataCommentsItem>>;
    save(filename: string, dataValues: DataCommentsItem[]): Promise<void>;
}

export interface NHWADataCommentsRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataCommentsItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    sectionIds: Id[];
}
