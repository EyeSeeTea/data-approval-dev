import { ATCItemIdentifier } from "../entities/GLASSDataMaintenanceItem";
import { GlassAtcVersionData } from "../entities/GlassAtcVersionData";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class UploadATCFileUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(
        namespace: string,
        glassAtcVersionData: GlassAtcVersionData,
        year: string,
        selectedItems?: ATCItemIdentifier[]
    ): Promise<void> {
        return this.maintenanceRepository.uploadATC(namespace, glassAtcVersionData, year, selectedItems);
    }
}
