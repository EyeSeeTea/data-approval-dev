import { OrgUnitWithChildren } from "../entities/OrgUnitWithChildren";

export interface OrgUnitWithChildrenRepository {
    get(): Promise<OrgUnitWithChildren[]>;
}
