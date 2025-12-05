import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { ProgramIndicatorItem } from "../entities/DataQualityItem";
import { DataQualityRepository, ProgramIndicatorOptions } from "../repositories/DataQualityRepository";

type DataElementsOptions = ProgramIndicatorOptions;

export class GetProgramIndicatorsUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(options: DataElementsOptions, namespace: string): Promise<PaginatedObjects<ProgramIndicatorItem>> {
        return this.dataQualityRepository.getProgramIndicators(options, namespace);
    }
}
