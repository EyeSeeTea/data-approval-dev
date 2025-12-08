import { PaginatedObjects } from "../common/entities/PaginatedObjects";
import { MetadataEntity } from "../entities/MetadataEntity";
import { FutureData } from "../generic/Future";

export interface MetadataEntityRepository {
    getBy(options: GetMetadataEntityOptions): FutureData<PaginatedObjects<MetadataEntity>>;
}

export type GetMetadataEntityOptions = {
    type: MetadataEntityType;
    page: number;
    pageSize: number;
    search: string;
    onlyWithCode: boolean;
};

export type MetadataEntityType = "dataElements" | "dataSets" | "sqlViews";
