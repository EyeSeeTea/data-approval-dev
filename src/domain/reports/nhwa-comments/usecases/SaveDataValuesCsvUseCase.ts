import { DataCommentsItem } from "../entities/DataCommentsItem";
import { NHWADataCommentsRepository } from "../repositories/NHWADataCommentsRepository";

export class SaveDataValuesUseCase {
    constructor(private dataValueRepository: NHWADataCommentsRepository) {}

    async execute(filename: string, dataValues: DataCommentsItem[]): Promise<void> {
        this.dataValueRepository.save(filename, dataValues);
    }
}
