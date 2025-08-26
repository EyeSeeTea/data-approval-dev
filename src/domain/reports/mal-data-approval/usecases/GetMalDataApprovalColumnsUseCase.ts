import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class GetMalDataApprovalColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.approvalRepository.getColumns(namespace);
    }
}
