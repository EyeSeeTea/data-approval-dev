import { UserSharing } from "../domain/entities/UserSharing";
import { FutureData } from "../domain/generic/Future";
import { UserSharingRepository } from "../domain/repositories/UserSharingRepository";
import { D2Api } from "../types/d2-api";
import { apiToFuture } from "./api-futures";

export class UserSharingD2Repository implements UserSharingRepository {
    constructor(private api: D2Api) {}

    get(query: string): FutureData<UserSharing> {
        const options = {
            // DHIS2 >= 43 flattens userCredentials fields into User; userCredentials is kept for older versions
            fields: { id: true, displayName: true, username: true, userCredentials: { username: true }, code: true },
            filter: { displayName: { ilike: query } },
        };

        return apiToFuture(this.api.metadata.get({ users: options, userGroups: options })).map(userSearch => ({
            users: userSearch.users.map(user => ({
                id: user.id,
                name: user.displayName,
                username: user.username ?? user.userCredentials?.username ?? "",
            })),
            userGroups: userSearch.userGroups
                .filter(userGroup => Boolean(userGroup.code))
                .map(userGroup => ({
                    id: userGroup.id,
                    name: userGroup.displayName,
                    code: userGroup.code,
                })),
        }));
    }
}
