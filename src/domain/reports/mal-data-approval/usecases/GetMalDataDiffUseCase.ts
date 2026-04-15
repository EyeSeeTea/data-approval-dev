import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { DataDiffItem } from "../entities/DataDiffItem";
import { MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";
import { UserReadableDataElementsService } from "../services/UserReadableDataElementsService";
import { Id } from "../../../common/entities/Base";

type GetDataDiffUseCaseOptions = Omit<MalDataApprovalOptions, "sorting"> & { sorting: Sorting<DataDiffItem> };

export class GetMalDataDiffUseCase implements UseCase {
    constructor(
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private userReadableDataElementsService: UserReadableDataElementsService
    ) {}

    async execute(options: GetDataDiffUseCaseOptions): Promise<PaginatedObjects<DataDiffItem>> {
        const malariaDataSetId = options.dataSetId;
        const orgUnitId = _(options.orgUnitIds).first();
        const period = _(options.periods).first();
        if (!malariaDataSetId) throw Error("No malaria data set ID provided");
        if (!orgUnitId) throw Error("No org unit ID provided");
        if (!period) throw Error("No period provided");

        const isCurrentUserSuperAdmin = await this.userReadableDataElementsService.isCurrentUserSuperAdmin();

        const shouldValidateDataElementGroup = shouldValidateDataElementGroupForDataSet(
            options.dataSetsConfig,
            malariaDataSetId,
            isCurrentUserSuperAdmin
        );

        const allowedOriginalDataElementIds = shouldValidateDataElementGroup
            ? await this.userReadableDataElementsService.getAllowedOriginalDataElementIds()
            : undefined;

        const dataElementsWithValues = await new WmrDiffReport(
            this.dataValueRepository,
            this.dataSetRepository,
            options.dataSetsConfig
        ).getDiff(malariaDataSetId, orgUnitId, period, false, allowedOriginalDataElementIds);

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

function shouldValidateDataElementGroupForDataSet(
    dataSetsConfig: GetDataDiffUseCaseOptions["dataSetsConfig"],
    dataSetId: Id,
    isCurrentUserSuperAdmin: boolean
): boolean {
    if (isCurrentUserSuperAdmin) return false;

    const dataSetConfig = dataSetsConfig.find(config => config.dataSet.id === dataSetId);
    return dataSetConfig?.configuration.validateDataElementGroup || false;
}
