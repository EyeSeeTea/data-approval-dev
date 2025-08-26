import { MetadataObject } from "../../../common/entities/MetadataObject";
import { WIDPAdminRepository } from "../repositories/WIDPAdminRepository";

export class SaveWIDPAdminDefaultCsvUseCase {
    constructor(private metadataRepository: WIDPAdminRepository) {}

    async execute(filename: string, metadata: MetadataObject[]): Promise<void> {
        this.metadataRepository.save(filename, metadata);
    }
}
