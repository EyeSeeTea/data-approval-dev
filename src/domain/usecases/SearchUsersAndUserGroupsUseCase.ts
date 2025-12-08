import { UserSharing } from "../entities/UserSharing";
import { FutureData } from "../generic/Future";
import { UserSharingRepository } from "../repositories/UserSharingRepository";

export class SearchUsersAndUserGroupsUseCase {
    constructor(
        private options: {
            userSharingRepository: UserSharingRepository;
        }
    ) {}

    public execute(name: string): FutureData<UserSharing> {
        return this.options.userSharingRepository.get(name);
    }
}
