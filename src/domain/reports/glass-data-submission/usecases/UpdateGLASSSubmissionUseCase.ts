import { UseCase } from "../../../../compositionRoot";
import {
    EARSubmissionItemIdentifier,
    GLASSDataSubmissionItemIdentifier,
    UpdateAction,
} from "../entities/GLASSDataSubmissionItem";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

// To-do: create separate use cases for each action
export class UpdateGLASSSubmissionUseCase implements UseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(
        namespace: string,
        action: UpdateAction,
        items: GLASSDataSubmissionItemIdentifier[],
        message?: string,
        isDatasetUpdate?: boolean,
        signals?: EARSubmissionItemIdentifier[]
    ): Promise<void> | Promise<string> | undefined {
        switch (action) {
            case "approve":
                return this.submissionRepository.approve(namespace, items, signals);
            case "reject":
                return this.submissionRepository.reject(namespace, items, message, isDatasetUpdate, signals);
            case "reopen":
                return this.submissionRepository.reopen(namespace, items);
            case "accept":
                return this.submissionRepository.accept(namespace, items);
            case "unapvdDashboard":
                return this.submissionRepository.getGLASSDashboardId();
            default:
                return;
        }
    }
}
