import { Id, NamedRef } from "./Base";
import { OrgUnit } from "./OrgUnit";

export interface User {
    id: Id;
    name: string;
    username: string;
    orgUnits: OrgUnit[];
    userRoles: NamedRef[];
    userGroups: NamedRef[];
    isAdmin: boolean;
    dataSets?: Record<Id, UserDataSetAction>;
}

export type UserDataSetAccess = Record<string, UserDataSetAction>;

export type UserDataSetAction = {
    complete: boolean;
    incomplete: boolean;
    monitoring: boolean;
    read: boolean;
    revoke: boolean;
    submit: boolean;
    approve: boolean;
};
