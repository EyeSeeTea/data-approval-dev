import { UseCase } from "../../../../compositionRoot";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class GetDataQualityColumnsUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.dataQualityRepository.getColumns(namespace);
    }
}
