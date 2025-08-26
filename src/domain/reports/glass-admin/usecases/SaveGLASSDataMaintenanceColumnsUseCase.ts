import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class SaveGLASSDataMaintenanceColumnsUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.maintenanceRepository.saveColumns(namespace, columns);
    }
}
