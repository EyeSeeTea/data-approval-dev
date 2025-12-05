import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    AuthoritiesMonitoringItem,
    AuthoritiesMonitoringPaginatedObjects,
} from "../entities/AuthoritiesMonitoringItem";

export interface AuthoritiesMonitoringRepository {
    get(
        namespace: string,
        options: AuthoritiesMonitoringOptions
    ): Promise<AuthoritiesMonitoringPaginatedObjects<AuthoritiesMonitoringItem>>;
    save(filename: string, items: AuthoritiesMonitoringItem[]): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}

export interface AuthoritiesMonitoringOptions {
    paging: Paging;
    sorting: Sorting<AuthoritiesMonitoringItem>;
    templateGroups: string[];
    usernameQuery: string;
    userRoles: string[];
}
