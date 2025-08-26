import { ATCItem, ATCPaginatedObjects } from "../entities/GLASSDataMaintenanceItem";
import { ATCOptions, GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetATCsUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(options: ATCOptions, namespace: string): Promise<ATCPaginatedObjects<ATCItem>> {
        return this.maintenanceRepository.getATCs(options, namespace);
    }
}
