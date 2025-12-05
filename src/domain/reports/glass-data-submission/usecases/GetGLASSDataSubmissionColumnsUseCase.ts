import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class GetGLASSDataSubmissionColumnsUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.submissionRepository.getColumns(namespace);
    }
}
