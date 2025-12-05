import { UseCase } from "../../../../compositionRoot";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class SaveApprovalColumnsUseCase implements UseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    execute(columns: string[]): Promise<void> {
        return this.approvalRepository.saveColumns(columns);
    }
}
