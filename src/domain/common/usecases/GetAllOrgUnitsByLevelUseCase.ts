import { promiseMap } from "../../../utils/promises";
import { OrgUnit } from "../entities/OrgUnit";
import { OrgUnitsRepository } from "../repositories/OrgUnitsRepository";

export class GetAllOrgUnitsByLevelUseCase {
    constructor(private orgUnitRepository: OrgUnitsRepository) {}

    async execute(options: { levels: number[] }): Promise<OrgUnit[]> {
        const orgUnits = await promiseMap(options.levels, level => this.orgUnitRepository.getByLevel(level.toString()));
        return orgUnits.flat();
    }
}
