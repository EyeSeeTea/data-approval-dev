import { D2Api } from "../types/d2-api";
import { UserRepository } from "../domain/repositories/UserRepository";
import { Future, FutureData } from "../domain/generic/Future";
import { apiToFuture } from "./api-futures";
import _ from "../domain/generic/Collection";
import { User } from "../domain/entities/User";

export class UserD2Repository implements UserRepository {
    constructor(private api: D2Api) {}

    getByUsernames(usernames: string[]): FutureData<User[]> {
        if (usernames.length === 0) return Future.success([]);
        const $requests = _(usernames)
            .chunk(100)
            .map(userIds => {
                return apiToFuture(
                    this.api.models.users.get({
                        fields: {
                            id: true,
                            displayName: true,
                            username: true,
                            userRoles: { authorities: true },
                        },
                        filter: { username: { in: userIds } },
                        paging: false,
                    })
                );
            })
            .value();

        return Future.parallel($requests, { concurrency: 3 }).map(allResponses => {
            return allResponses.flat().flatMap(response => {
                return response.objects.map(d2User => {
                    return User.create({
                        id: d2User.id,
                        name: d2User.displayName,
                        username: d2User.username,
                        userGroups: [],
                        userRoles: [],
                        isSuperAdmin: d2User.userRoles.some(role => role.authorities.includes("ALL")),
                    });
                });
            });
        });
    }

    public getCurrent(): FutureData<User> {
        return apiToFuture(this.api.currentUser.get({ fields: currentUserFields })).map(
            d2User =>
                new User({
                    id: d2User.id,
                    name: d2User.displayName,
                    userGroups: d2User.userGroups,
                    username: d2User.username,
                    userRoles: d2User.userRoles,
                    isSuperAdmin: d2User.authorities.includes("ALL"),
                })
        );
    }
}

const currentUserFields = {
    id: true,
    displayName: true,
    userGroups: { id: true, name: true, code: true },
    username: true,
    userRoles: { id: true, name: true },
    authorities: true,
} as const;
