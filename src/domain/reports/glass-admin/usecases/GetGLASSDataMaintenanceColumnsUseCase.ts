import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetGLASSDataMaintenanceColumnsUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.maintenanceRepository.getColumns(namespace);
    }
}
