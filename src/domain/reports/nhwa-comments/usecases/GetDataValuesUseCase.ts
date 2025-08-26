import {
    NHWADataCommentsRepository,
    NHWADataCommentsRepositoryGetOptions,
} from "../repositories/NHWADataCommentsRepository";
import { DataCommentsItem } from "../entities/DataCommentsItem";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";

type GetDataValuesUseCaseOptions = NHWADataCommentsRepositoryGetOptions;

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: NHWADataCommentsRepository) {}

    execute(options: GetDataValuesUseCaseOptions): Promise<PaginatedObjects<DataCommentsItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
