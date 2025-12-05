import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { GLASSDataSubmissionItem } from "../entities/GLASSDataSubmissionItem";
import {
    GLASSDataSubmissionOptions,
    GLASSDataSubmissionRepository,
} from "../repositories/GLASSDataSubmissionRepository";

type DataSubmissionOptions = GLASSDataSubmissionOptions;

export class GetGLASSDataSubmissionUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(options: DataSubmissionOptions, namespace: string): Promise<PaginatedObjects<GLASSDataSubmissionItem>> {
        return this.submissionRepository.get(options, namespace);
    }
}
