import { D2Api } from "@eyeseetea/d2-api/2.34";
import {
    UserGroup,
    UserGroupRepository,
} from "../../../domain/reports/mal-data-approval/repositories/UserGroupRepository";

export class UserGroupD2Repository implements UserGroupRepository {
    constructor(private api: D2Api) {}

    async getUserGroupByCode(code: string): Promise<UserGroup> {
        const { objects: userGroups } = await this.api.models.userGroups
            .get({ fields: { id: true }, filter: { code: { eq: code } } })
            .getData();

        const userGroup = userGroups[0];
        if (!userGroup) {
            throw new Error(`User group with code ${code} not found`);
        }

        return userGroup;
    }
}
