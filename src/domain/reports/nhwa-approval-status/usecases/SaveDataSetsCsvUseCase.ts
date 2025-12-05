import { UseCase } from "../../../../compositionRoot";
import { DataApprovalItem } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class SaveDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: NHWADataApprovalRepository) {}

    async execute(filename: string, dataSets: DataApprovalItem[]): Promise<void> {
        this.dataSetRepository.save(filename, dataSets);
    }
}
