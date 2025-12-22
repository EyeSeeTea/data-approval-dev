import { UseCase } from "../../../../compositionRoot";
import { promiseMap } from "../../../../utils/promises";
import { Id } from "../../../common/entities/Base";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { WmrDiffReport } from "../../WmrDiffReport";
import { MalDataApprovalItem } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository, MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";

type DataSetsOptions = Omit<MalDataApprovalOptions, "dataSetId"> & { dataSetIds: Id[] };

export class GetMalDataSetsUseCase implements UseCase {
    constructor(
        private malDataRepository: MalDataApprovalRepository,
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository
    ) {}

    async execute(options: DataSetsOptions): Promise<PaginatedObjects<MalDataApprovalItem>> {
        if (options.dataSetIds.length === 0)
            return Promise.resolve({ objects: [], pager: { page: 0, pageCount: 0, pageSize: 0, total: 0 } });

        const allRecords = await promiseMap(options.dataSetIds, async dataSetId => {
            const { dataSetIds: _, ...rest } = options;
            const result = await this.malDataRepository.get({ ...rest, dataSetId: dataSetId });

            const response = await promiseMap(result.objects, async item => {
                const dataElementsWithValues = await new WmrDiffReport(
                    this.dataValueRepository,
                    this.dataSetRepository,
                    options.dataSetsConfig
                ).getDiff(item.dataSetUid, item.orgUnitUid, item.period);

                return {
                    ...item,
                    // TODO: remove all monitoring related code
                    monitoring: false,
                    modificationCount: dataElementsWithValues.length > 0 ? String(dataElementsWithValues.length) : "",
                };
            });

            return { ...result, objects: response };
        });

        const allObjects = allRecords.flatMap(record => record.objects);
        const pagination = allRecords[0]?.pager;
        if (!pagination) throw new Error("No pagination information found");

        return { objects: allObjects, pager: { ...pagination, total: allObjects.length } };
    }
}
