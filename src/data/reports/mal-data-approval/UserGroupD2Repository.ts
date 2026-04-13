import { D2Api } from "@eyeseetea/d2-api/2.34";
import { Future, FutureData } from "../../../domain/generic/Future";
import {
    UserGroup,
    UserGroupRepository,
} from "../../../domain/reports/mal-data-approval/repositories/UserGroupRepository";
import _ from "../../../domain/generic/Collection";
import { apiToFuture } from "../../api-futures";

export class UserGroupD2Repository implements UserGroupRepository {
    constructor(private api: D2Api) {}

    getByCodes(codes: string[]): FutureData<UserGroup[]> {
        if (codes.length === 0) return Future.success([]);

        const $requests = _(codes)
            .chunk(100)
            .map(groupCodes => {
                return apiToFuture(
                    this.api.models.userGroups.get({
                        fields: { id: true, displayName: true, code: true },
                        filter: { code: { in: groupCodes } },
                        paging: false,
                    })
                );
            })
            .value();

        return Future.parallel($requests, { concurrency: 3 }).map(allResponses => {
            return allResponses.flat().flatMap(response => {
                return response.objects.map(d2UserGroup => {
                    return { id: d2UserGroup.id, name: d2UserGroup.displayName, code: d2UserGroup.code };
                });
            });
        });
    }

    async getUserGroupByCode(code: string): Promise<UserGroup> {
        const { objects: userGroups } = await this.api.models.userGroups
            .get({ fields: { id: true, displayName: true, code: true }, filter: { code: { eq: code } } })
            .getData();

        const userGroup = userGroups[0];
        if (!userGroup) {
            throw new Error(`User group with code ${code} not found`);
        }

        return { id: userGroup.id, name: userGroup.displayName, code: userGroup.code };
    }
}
