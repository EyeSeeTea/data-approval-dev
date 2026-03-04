import _ from "lodash";
import { D2Api } from "../../../types/d2-api";
import {
    DataElementGroup,
    DataElementGroupRepository,
    Permissions,
} from "../../../domain/reports/mal-data-approval/repositories/DataElementGroupRepository";
import { Maybe } from "../../../types/utils";

export class DataElementGroupD2Repository implements DataElementGroupRepository {
    constructor(private api: D2Api) {}

    async getAll(): Promise<DataElementGroup[]> {
        const response = await this.api.models.dataElementGroups
            .get({
                fields: {
                    id: true,
                    dataElements: true,
                    sharing: { public: true, owner: true, userGroups: true, users: true },
                },
                paging: false,
            })
            .getData();

        return response.objects.map(d2DataElementGroup => {
            const groupsWithPermissions = _(d2DataElementGroup.sharing.userGroups)
                .map((userGroup): Maybe<Permissions> => {
                    const hasAccess = userGroup.access.startsWith("r");

                    if (!hasAccess) return undefined;

                    return { id: userGroup.id, hasReadAccess: hasAccess };
                })
                .compact()
                .value();

            const usersWithPermissions = _(d2DataElementGroup.sharing.users)
                .map((user): Maybe<Permissions> => {
                    const hasAccess = user.access.startsWith("r");

                    if (!hasAccess) return undefined;

                    return { id: user.id, hasReadAccess: hasAccess };
                })
                .compact()
                .value();

            return {
                id: d2DataElementGroup.id,
                groups: groupsWithPermissions,
                users: usersWithPermissions.concat([{ id: d2DataElementGroup.sharing.owner, hasReadAccess: true }]),
                dataElements: d2DataElementGroup.dataElements.map(dataElement => ({ id: dataElement.id })),
            };
        });
    }
}
