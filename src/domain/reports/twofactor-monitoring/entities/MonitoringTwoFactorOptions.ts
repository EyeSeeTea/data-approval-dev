import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { MonitoringTwoFactorUser } from "./MonitoringTwoFactorUser";

export interface MonitoringTwoFactorOptions {
    paging: Paging;
    sorting: Sorting<MonitoringTwoFactorUser>;
    usernameQuery: string;
    groups: string[];
}
