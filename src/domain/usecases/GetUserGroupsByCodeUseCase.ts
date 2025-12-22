import { FutureData } from "../generic/Future";
import { UserGroupRepository, UserGroup } from "../reports/mal-data-approval/repositories/UserGroupRepository";

export class GetUserGroupsByCodeUseCase {
    constructor(private options: { userGroupRepository: UserGroupRepository }) {}

    public execute(codes: string[]): FutureData<UserGroup[]> {
        return this.options.userGroupRepository.getByCodes(codes);
    }
}
