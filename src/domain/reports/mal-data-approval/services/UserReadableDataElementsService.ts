import { Id } from "../../../common/entities/Base";
import { UserRepository } from "../../../repositories/UserRepository";
import { DataElementGroupRepository } from "../repositories/DataElementGroupRepository";

export class UserReadableDataElementsService {
    constructor(
        private userRepository: UserRepository,
        private dataElementGroupRepository: DataElementGroupRepository
    ) {}

    async getAllowedOriginalDataElementIds(): Promise<Id[]> {
        const [currentUser, dataElementGroups] = await Promise.all([
            this.userRepository.getCurrent().toPromise(),
            this.dataElementGroupRepository.getAll(),
        ]);

        const userGroupIds = currentUser.userGroups.map(group => group.id);

        const readableGroups = dataElementGroups.filter(group => {
            const userIsInGroup = group.groups.some(
                groupPermission => groupPermission.hasReadAccess && userGroupIds.includes(groupPermission.id)
            );
            const userIsInUsers = group.users.some(
                userPermission => userPermission.hasReadAccess && userPermission.id === currentUser.id
            );

            return userIsInGroup || userIsInUsers;
        });

        return Array.from(
            new Set(readableGroups.flatMap(group => group.dataElements.map(dataElement => dataElement.id)))
        );
    }

    async isCurrentUserSuperAdmin(): Promise<boolean> {
        const currentUser = await this.userRepository.getCurrent().toPromise();
        return currentUser.isSuperAdmin;
    }
}
