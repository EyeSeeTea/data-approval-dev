import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class SaveMalDiffNamesUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(dataSetId: string): Promise<void> {
        return this.approvalRepository.saveMalDiffNames(dataSetId);
    }
}
