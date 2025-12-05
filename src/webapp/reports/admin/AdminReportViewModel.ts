import { Id } from "../../../domain/common/entities/Base";
import { MetadataObject } from "../../../domain/common/entities/MetadataObject";

export interface AdminReportViewModel {
    id: Id;
    name: string;
    metadataType: string;
    publicAccess: string;
    createdBy: string;
    lastUpdatedBy: string;
    userGroupAccess: string;
    userAccess: string;
    created: string;
    lastUpdated: string;
}

export function getAdminReportViews(metadataObjects: MetadataObject[]): AdminReportViewModel[] {
    return metadataObjects.map(object => {
        return {
            id: object.Id,
            name: object.name,
            metadataType: object.metadataType,
            publicAccess: object.publicAccess,
            createdBy: object.createdBy ?? "-",
            lastUpdatedBy: object.lastUpdatedBy ?? "-",
            userGroupAccess: object.userGroupAccess ?? "-",
            userAccess: object.userAccess ?? "-",
            created: object.created ?? "-",
            lastUpdated: object.lastUpdated ?? "-",
        };
    });
}
