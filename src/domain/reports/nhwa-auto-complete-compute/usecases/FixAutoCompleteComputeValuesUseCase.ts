import _ from "lodash";
import { AutoCompleteComputeViewModel } from "../../../../webapp/reports/nhwa-auto-complete-compute/NHWAAutoCompleteCompute";
import { DataValueToPost } from "../../../common/entities/DataValue";
import { Stats } from "../../../common/entities/Stats";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";

export class FixAutoCompleteComputeValuesUseCase {
    constructor(private dataValuesRepository: DataValuesRepository) {}

    async execute(values: AutoCompleteComputeViewModel[]): Promise<Stats> {
        const dataValuesToDelete = values.filter(dv => dv.valueToFix === "Empty").map(this.convertToDataValueToPost());

        const dataValuesToSave: DataValueToPost[] = values
            .filter(dv => dv.valueToFix !== "Empty")
            .map(this.convertToDataValueToPost());

        const statsSaved = await this.dataValuesRepository.saveAll(dataValuesToSave);
        const statsDeleted = await this.dataValuesRepository.deleteAll(dataValuesToDelete);

        return {
            deleted: statsSaved.deleted + statsDeleted.deleted,
            imported: statsSaved.imported + statsDeleted.imported,
            updated: statsSaved.updated + statsDeleted.updated,
            ignored: statsSaved.ignored + statsDeleted.ignored,
            errorMessages: _(statsSaved.errorMessages)
                .concat(statsDeleted.errorMessages)
                .uniqBy(message => message.message)
                .value(),
        };
    }

    private convertToDataValueToPost(): (
        value: AutoCompleteComputeViewModel,
        index: number,
        array: AutoCompleteComputeViewModel[]
    ) => { categoryOptionCombo: string; dataElement: string; period: string; orgUnit: string; value: string } {
        return dv => {
            return {
                categoryOptionCombo: dv.categoryOptionCombo.id,
                dataElement: dv.dataElement.id,
                period: dv.period,
                orgUnit: dv.orgUnit.id,
                value: dv.valueToFix === "Empty" ? "" : dv.valueToFix,
            };
        };
    }
}
