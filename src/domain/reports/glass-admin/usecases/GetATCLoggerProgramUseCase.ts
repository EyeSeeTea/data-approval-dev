import { AMCRecalculation } from "../entities/GLASSDataMaintenanceItem";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetATCLoggerProgramUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    async execute(namespace: string, amcRecalculation: AMCRecalculation): Promise<string> {
        return this.maintenanceRepository.getLoggerProgramName(amcRecalculation.loggerProgram);
    }
}
