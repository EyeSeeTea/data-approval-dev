import { UseCase } from "../../../../compositionRoot";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class GetApprovalColumnsUseCase implements UseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    execute(): Promise<string[]> {
        return this.approvalRepository.getColumns();
    }
}
