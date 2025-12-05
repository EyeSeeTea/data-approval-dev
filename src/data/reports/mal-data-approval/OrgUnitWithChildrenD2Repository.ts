import { D2Api } from "@eyeseetea/d2-api/2.34";
import _ from "lodash";
import { OrgUnitWithChildren } from "../../../domain/reports/mal-data-approval/entities/OrgUnitWithChildren";
import { OrgUnitWithChildrenRepository } from "../../../domain/reports/mal-data-approval/repositories/OrgUnitWithChildrenRepository";

export class OrgUnitWithChildrenD2Repository implements OrgUnitWithChildrenRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<OrgUnitWithChildren[]> {
        const { organisationUnits } = await this.api.metadata
            .get({
                organisationUnits: {
                    filter: { level: { in: levels } },
                    fields: {
                        id: true,
                        path: true,
                        displayName: true,
                        level: true,
                        children: { level: true, path: true },
                    },
                },
            })
            .getData();

        return _.orderBy(
            organisationUnits.map(orgUnit => ({ ...orgUnit, name: orgUnit.displayName })),
            "level",
            "asc"
        );
    }
}

const levels = ["1", "2", "3"];
