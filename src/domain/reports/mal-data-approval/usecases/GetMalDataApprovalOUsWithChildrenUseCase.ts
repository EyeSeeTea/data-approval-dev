import { UseCase } from "../../../../compositionRoot";
import { OrgUnitWithChildren } from "../entities/OrgUnitWithChildren";
import { OrgUnitWithChildrenRepository } from "../repositories/OrgUnitWithChildrenRepository";

export class GetMalDataApprovalOUsWithChildrenUseCase implements UseCase {
    constructor(private orgUnitRepository: OrgUnitWithChildrenRepository) {}

    execute(): Promise<OrgUnitWithChildren[]> {
        return this.orgUnitRepository.get();
    }
}
