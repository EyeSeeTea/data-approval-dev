import { UseCase } from "../../../../compositionRoot";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class SaveDataQualityColumnsUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.dataQualityRepository.saveColumns(namespace, columns);
    }
}
