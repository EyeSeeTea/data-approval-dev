import { UseCase } from "../../../../compositionRoot";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class LoadDataQualityValidation implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(): Promise<void> {
        return this.dataQualityRepository.loadValidation();
    }
}
