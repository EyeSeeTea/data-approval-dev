import { OrgUnit, OrgUnitPath } from "../entities/OrgUnit";
import { OrgUnitsRepository } from "../repositories/OrgUnitsRepository";

export class GetOrgUnitsUseCase {
    constructor(private orgUnitsRepository: OrgUnitsRepository) {}

    execute(options: { paths: OrgUnitPath[] }): Promise<OrgUnit[]> {
        return this.orgUnitsRepository.getFromPaths(options.paths);
    }
}
