import { Ref } from "../../../common/entities/Base";
import { NamedRef } from "../../../common/entities/Ref";
import { FutureData } from "../../../generic/Future";

export interface UserGroupRepository {
    getUserGroupByCode(code: string): Promise<UserGroup>;
    getByCodes(codes: string[]): FutureData<UserGroup[]>;
}

export type UserGroup = NamedRef & { code: string };
