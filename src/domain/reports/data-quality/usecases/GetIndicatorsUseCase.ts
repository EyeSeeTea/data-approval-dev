import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { IndicatorItem } from "../entities/DataQualityItem";
import { DataQualityRepository, IndicatorOptions } from "../repositories/DataQualityRepository";

type DataElementsOptions = IndicatorOptions;

export class GetIndicatorsUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(options: DataElementsOptions, namespace: string): Promise<PaginatedObjects<IndicatorItem>> {
        return this.dataQualityRepository.getIndicators(options, namespace);
    }
}
