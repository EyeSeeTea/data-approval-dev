import { OrgUnit } from "../entities/OrgUnit";
import { OrgUnitsRepository } from "../repositories/OrgUnitsRepository";

export class GetOrgUnitsByLevelUseCase {
    constructor(private orgUnitsRepository: OrgUnitsRepository) {}

    execute(level: string): Promise<OrgUnit[]> {
        return this.orgUnitsRepository.getByLevel(level);
    }
}
