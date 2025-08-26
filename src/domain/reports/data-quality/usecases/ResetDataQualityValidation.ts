import { UseCase } from "../../../../compositionRoot";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class ResetDataQualityValidation implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(): Promise<void> {
        return this.dataQualityRepository.resetValidation();
    }
}
