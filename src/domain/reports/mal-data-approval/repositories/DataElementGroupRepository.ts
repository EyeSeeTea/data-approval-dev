import { Id } from "../../../common/entities/Base";
import { Ref } from "../../../common/entities/Ref";

export interface DataElementGroupRepository {
    getAll(): Promise<DataElementGroup[]>;
}

export type DataElementGroup = {
    id: Id;
    groups: Permissions[];
    users: Permissions[];
    dataElements: Ref[];
};

export type Permissions = {
    id: Id;
    hasReadAccess: boolean;
};
