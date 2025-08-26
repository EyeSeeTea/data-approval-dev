import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalItem } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class SaveMalDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: MalDataApprovalRepository) {}

    async execute(filename: string, dataSets: MalDataApprovalItem[]): Promise<void> {
        this.dataSetRepository.save(filename, dataSets);
    }
}
