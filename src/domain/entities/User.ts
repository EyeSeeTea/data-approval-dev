import { Id, NamedRef } from "../common/entities/Base";
import { Struct } from "../generic/Struct";

export type UserAttrs = {
    id: Id;
    name: string;
    username: string;
    userRoles: UserRole[];
    userGroups: Array<NamedRef & { code: string }>;
    isSuperAdmin: boolean;
};

export type UserRole = {
    id: Id;
    name: string;
};

export class User extends Struct<UserAttrs>() {
    belongToUserGroup(userGroupUid: string): boolean {
        return this.userGroups.some(({ id }) => id === userGroupUid);
    }
}
