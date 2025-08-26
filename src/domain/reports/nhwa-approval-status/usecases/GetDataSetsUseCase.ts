import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataApprovalItem } from "../../nhwa-approval-status/entities/DataApprovalItem";
import {
    NHWADataApprovalRepository,
    NHWADataApprovalRepositoryGetOptions,
} from "../../nhwa-approval-status/repositories/NHWADataApprovalRepository";

type GetDataSetsUseCaseOptions = NHWADataApprovalRepositoryGetOptions;

export class GetDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: NHWADataApprovalRepository) {}

    execute(options: GetDataSetsUseCaseOptions): Promise<PaginatedObjects<DataApprovalItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.get(options);
    }
}
