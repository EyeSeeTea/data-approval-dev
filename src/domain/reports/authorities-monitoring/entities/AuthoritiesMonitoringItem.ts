import { PaginatedObjects } from "../../../../types/d2-api";
import { UserRole } from "./UserPermissions";

export interface AuthoritiesMonitoringItem {
    id: string;
    name: string;
    lastLogin: string;
    username: string;
    roles: UserRole[];
    authorities: string[];
    templateGroups: string[];
}

export interface AuthoritiesMonitoringPaginatedObjects<T> extends PaginatedObjects<T> {
    templateGroups: string[];
    userRoles: UserRole[];
}

export function getDataMonitoringItemId(item: AuthoritiesMonitoringItem): string {
    return [item.id, item.templateGroups].join("-");
}
