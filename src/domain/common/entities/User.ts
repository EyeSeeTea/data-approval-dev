import { Id, NamedRef } from "./Base";
import { OrgUnit } from "./OrgUnit";

export interface User {
    id: Id;
    name: string;
    username: string;
    orgUnits: OrgUnit[];
    userRoles: NamedRef[];
    userGroups: Array<NamedRef & { code: string }>;
    isAdmin: boolean;
}
