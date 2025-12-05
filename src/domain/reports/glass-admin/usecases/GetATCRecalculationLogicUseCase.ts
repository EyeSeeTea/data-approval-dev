import { AMCRecalculation as ATCRecalculation } from "../entities/GLASSDataMaintenanceItem";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetATCRecalculationLogicUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string): Promise<ATCRecalculation | undefined> {
        return this.maintenanceRepository.getRecalculationLogic(namespace);
    }
}
