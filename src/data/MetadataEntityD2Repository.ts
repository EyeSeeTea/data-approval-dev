import _ from "../domain/generic/Collection";
import { PaginatedObjects } from "../domain/common/entities/PaginatedObjects";
import { MetadataEntity } from "../domain/entities/MetadataEntity";
import { FutureData } from "../domain/generic/Future";
import {
    GetMetadataEntityOptions,
    MetadataEntityRepository,
    MetadataEntityType,
} from "../domain/repositories/MetadataEntityRepository";
import { D2Api } from "../types/d2-api";
import { apiToFuture } from "./api-futures";

export class MetadataEntityD2Repository implements MetadataEntityRepository {
    constructor(private api: D2Api) {}

    getBy(options: GetMetadataEntityOptions): FutureData<PaginatedObjects<MetadataEntity>> {
        const { type, page, pageSize } = options;

        const filter = this.buildFilters(options);

        return apiToFuture(
            this.api.request<DynamicApiResponse<typeof type, CommonObject>>({
                method: "get",
                url: `/${type}`,
                params: {
                    fields: "id,displayName,code",
                    page,
                    pageSize,
                    filter,
                },
            })
        ).map(res => {
            return {
                pager: {
                    page: res.pager.page,
                    pageSize: res.pager.pageSize,
                    total: res.pager.total,
                    pageCount: res.pager.pageCount,
                },
                objects: res[type].map(obj =>
                    MetadataEntity.create({ code: obj.code, id: obj.id, name: obj.displayName })
                ),
            };
        });
    }

    private buildFilters(options: GetMetadataEntityOptions): string[] {
        const { search, onlyWithCode } = options;
        const searchFilter = search ? `identifiable:token:${search}` : undefined;
        const codeFilter = onlyWithCode ? "code:ge:0" : undefined;

        return _([searchFilter, codeFilter])
            .compactMap(value => value)
            .value();
    }
}

type DynamicApiResponse<K extends MetadataEntityType, T extends CommonObject> = Record<K, T[]> & {
    pager: {
        page: number;
        pageSize: number;
        total: number;
        pageCount: number;
    };
};

type CommonObject = {
    id: string;
    displayName: string;
    code: string;
};
