import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class GetSortOrderUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(): Promise<string[]> {
        return this.approvalRepository.getSortOrder();
    }
}
