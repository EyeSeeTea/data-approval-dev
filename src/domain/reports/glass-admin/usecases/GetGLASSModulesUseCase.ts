import { Config } from "../../../common/entities/Config";
import { GLASSModule } from "../entities/GLASSDataMaintenanceItem";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetGLASSModulesUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(config: Config): Promise<GLASSModule[]> {
        return this.maintenanceRepository.getUserModules(config);
    }
}
