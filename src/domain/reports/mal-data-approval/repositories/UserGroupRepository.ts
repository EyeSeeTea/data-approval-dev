import { Ref } from "../../../common/entities/Base";

export interface UserGroupRepository {
    getUserGroupByCode(code: string): Promise<UserGroup>;
}

export type UserGroup = Ref;
