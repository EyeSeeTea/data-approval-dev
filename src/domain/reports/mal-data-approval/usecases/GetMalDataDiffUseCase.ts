import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects, Sorting } from "../../../common/entities/PaginatedObjects";
import { AppSettingsRepository } from "../../../common/repositories/AppSettingsRepository";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { DataDiffItem } from "../entities/DataDiffItem";
import { MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";

type GetDataDiffUseCaseOptions = Omit<MalDataApprovalOptions, "sorting"> & { sorting: Sorting<DataDiffItem> };

export class GetMalDataDiffUseCase implements UseCase {
    constructor(
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private appSettings: AppSettingsRepository
    ) {}

    async execute(options: GetDataDiffUseCaseOptions): Promise<PaginatedObjects<DataDiffItem>> {
        const settings = await this.appSettings.get();
        const malariaDataSetId = options.dataSetId;
        const orgUnitId = _(options.orgUnitIds).first();
        const period = _(options.periods).first();
        if (!malariaDataSetId) throw Error("No malaria data set ID provided");
        if (!orgUnitId) throw Error("No org unit ID provided");
        if (!period) throw Error("No period provided");

        const dataElementsWithValues = await new WmrDiffReport(
            this.dataValueRepository,
            this.dataSetRepository,
            settings
        ).getDiff(malariaDataSetId, orgUnitId, period);

        return {
            objects: dataElementsWithValues,
            pager: {
                pageCount: 1,
                page: 1,
                pageSize: 10,
                total: dataElementsWithValues.length,
            },
        };
    }
}
