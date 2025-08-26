import { DataApprovalItemIdentifier } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class UpdateStatusUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    async execute(items: DataApprovalItemIdentifier[], action: UpdateAction): Promise<boolean> {
        switch (action) {
            case "complete":
                return this.approvalRepository.complete(items);
            case "approve":
                return this.approvalRepository.approve(items);
            case "unapprove":
                return this.approvalRepository.unapprove(items);
            case "incomplete":
                return this.approvalRepository.incomplete(items);
            default:
                return false;
        }
    }
}

type UpdateAction = "approve" | "complete" | "unapprove" | "incomplete";
