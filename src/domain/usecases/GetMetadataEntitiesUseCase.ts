import { PaginatedObjects } from "../common/entities/PaginatedObjects";
import { MetadataEntity } from "../entities/MetadataEntity";
import { FutureData } from "../generic/Future";
import { GetMetadataEntityOptions, MetadataEntityRepository } from "../repositories/MetadataEntityRepository";

export class GetMetadataEntitiesUseCase {
    constructor(private options: { metadataEntityRepository: MetadataEntityRepository }) {}

    execute(options: GetMetadataEntityOptions): FutureData<PaginatedObjects<MetadataEntity>> {
        return this.options.metadataEntityRepository.getBy(options);
    }
}
