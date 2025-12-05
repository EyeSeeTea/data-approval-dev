import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { EARDataSubmissionItem } from "../entities/GLASSDataSubmissionItem";
import { EARDataSubmissionOptions, GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class GetEARDataSubmissionUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(options: EARDataSubmissionOptions, namespace: string): Promise<PaginatedObjects<EARDataSubmissionItem>> {
        return this.submissionRepository.getEAR(options, namespace);
    }
}
