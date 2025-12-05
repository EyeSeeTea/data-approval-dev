import _ from "lodash";
import { FixTotalsViewModel } from "../../../../webapp/reports/nhwa-fix-totals-activity-level/NHWAFixTotals";
import { DataValueToPost } from "../../../common/entities/DataValue";
import { Stats } from "../../../common/entities/Stats";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";

export class FixTotalsValuesUseCase {
    constructor(private dataValuesRepository: DataValuesRepository) {}

    async execute(values: FixTotalsViewModel[]): Promise<Stats> {
        const dataValuesToSave = values.map(dv => this.convertToDataValueToPost(dv));
        const statsSaved = await this.dataValuesRepository.saveAll(dataValuesToSave);
        return statsSaved;
    }

    private convertToDataValueToPost(fixTotal: FixTotalsViewModel): DataValueToPost {
        const cocId = _(fixTotal.id).split(".").last();
        if (!cocId) {
            throw Error("Could not found category option combo");
        }
        return {
            categoryOptionCombo: cocId,
            dataElement: fixTotal.dataElement.id,
            period: fixTotal.period,
            orgUnit: fixTotal.orgUnit.id,
            value: fixTotal.correctTotal,
            comment: fixTotal.comment,
        };
    }
}
