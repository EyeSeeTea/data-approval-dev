import { Id } from "./Base";

export interface MetadataObject {
    Id: Id;
    name: string;
    metadataType: string;
    publicAccess: string;
    createdBy?: string;
    lastUpdatedBy?: string;
    userGroupAccess?: string;
    userAccess?: string;
    lastUpdated?: string;
    created?: string;
}
