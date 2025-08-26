import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class SaveGLASSDataSubmissionColumnsUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.submissionRepository.saveColumns(namespace, columns);
    }
}
