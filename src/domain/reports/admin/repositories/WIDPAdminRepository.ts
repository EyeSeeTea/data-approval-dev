import { Sorting } from "../../../common/entities/PaginatedObjects";
import { MetadataObject } from "../../../common/entities/MetadataObject";

export interface WIDPAdminRepository {
    getPublicMetadata(options: WIDPAdmiRepositoryGetOptions): Promise<Array<MetadataObject>>;
    getInvalidSharingSetting(options: WIDPAdmiRepositoryGetOptions): Promise<Array<MetadataObject>>;
    save(filename: string, metadataObjects: MetadataObject[]): Promise<void>;
}

export interface WIDPAdmiRepositoryGetOptions {
    sorting: Sorting<MetadataObject>;
    publicObjects: boolean;
    removeTypes: string[];
}
