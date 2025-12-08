import { D2Api, MetadataPick } from "../types/d2-api";
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
                        fields: { id: true, displayName: true, userCredentials: { username: true } },
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
                        username: d2User.userCredentials.username,
                        userGroups: [],
                        userRoles: [],
                        isSuperAdmin: false,
                    });
                });
            });
        });
    }

    public getCurrent(): FutureData<User> {
        return apiToFuture(this.api.currentUser.get({ fields: userFields })).map(d2User => {
            const res = this.buildUser(d2User);
            return res;
        });
    }

    private buildUser(d2User: D2User) {
        return new User({
            id: d2User.id,
            name: d2User.displayName,
            userGroups: d2User.userGroups,
            ...d2User.userCredentials,
            isSuperAdmin: true,
        });
    }
}

const userFields = {
    id: true,
    displayName: true,
    userGroups: { id: true, name: true, code: true },
    userCredentials: {
        username: true,
        userRoles: { id: true, name: true, authorities: true },
    },
} as const;

type D2User = MetadataPick<{ users: { fields: typeof userFields } }>["users"][number];
