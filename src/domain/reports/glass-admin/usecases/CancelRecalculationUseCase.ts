import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class CancelRecalculationUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string): Promise<void> {
        return this.maintenanceRepository.cancelRecalculation(namespace);
    }
}
