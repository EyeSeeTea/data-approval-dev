import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { NamedRef } from "../../../common/entities/Ref";
import { MonitoringTwoFactorUser } from "./MonitoringTwoFactorUser";

export interface MonitoringTwoFactorPaginatedObjects<T> extends PaginatedObjects<T> {
    users: MonitoringTwoFactorUser[];
    groups: NamedRef[];
}
