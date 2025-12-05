import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class SaveMalDataApprovalColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.approvalRepository.saveColumns(namespace, columns);
    }
}
