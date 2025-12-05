import { Id } from "../../../common/entities/Base";
import { DataValueToPost } from "../../../common/entities/DataValue";
import { Stats } from "../../../common/entities/Stats";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { SubnationalCorrect } from "../entities/SubnationalCorrect";
import { SubnationalCorrectSettingsRepository } from "../repositories/SubnationalSettingsRepository";

export class DismissSubnationalCorrectValuesUseCase {
    constructor(
        private dataValuesRepository: DataValuesRepository,
        private settingsRepository: SubnationalCorrectSettingsRepository
    ) {}

    async execute(values: SubnationalCorrect[]): Promise<Stats> {
        const settings = await this.settingsRepository.get();
        const dataValuesToSave = values.map(dv => this.convertToDataValueToPost(dv, settings.subnationalDataSet));
        const statsSaved = await this.dataValuesRepository.saveAll(dataValuesToSave);
        return statsSaved;
    }

    private convertToDataValueToPost(
        subnationalCorrect: SubnationalCorrect,
        subnationalDataSetId: Id
    ): DataValueToPost {
        return {
            categoryOptionCombo: subnationalCorrect.categoryOptionCombo,
            dataElement: subnationalCorrect.dataElement,
            period: subnationalCorrect.period,
            orgUnit: subnationalCorrect.orgUnit.id,
            value: subnationalCorrect.orgUnit.name,
            dataSet: subnationalDataSetId,
        };
    }
}
