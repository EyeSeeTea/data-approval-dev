import { UseCase } from "../../../../compositionRoot";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class DHIS2MessageCountUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    public execute(): Promise<number> {
        return this.submissionRepository.dhis2MessageCount();
    }
}
