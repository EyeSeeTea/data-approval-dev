import { UseCase } from "../../../../compositionRoot";
import { DataQualityConfig } from "../entities/DataQualityItem";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class SaveDataQualityUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(namespace: string, dataQuality: DataQualityConfig): Promise<void> {
        return this.dataQualityRepository.saveDataQuality(namespace, dataQuality);
    }
}
