import { OrgUnitWithChildren } from "../entities/OrgUnit";
import { GLASSDataSubmissionRepository } from "../repositories/GLASSDataSubmissionRepository";

export class GetOrgUnitsWithChildrenUseCase {
    constructor(private submissionRepository: GLASSDataSubmissionRepository) {}

    execute(): Promise<OrgUnitWithChildren[]> {
        return this.submissionRepository.getOrganisationUnitsWithChildren();
    }
}
