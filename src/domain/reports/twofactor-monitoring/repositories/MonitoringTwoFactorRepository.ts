import { MonitoringTwoFactorOptions } from "../entities/MonitoringTwoFactorOptions";
import { MonitoringTwoFactorPaginatedObjects } from "../entities/MonitoringTwoFactorPaginatedObjects";
import { MonitoringTwoFactorUser } from "../entities/MonitoringTwoFactorUser";

export interface MonitoringTwoFactorRepository {
    get(
        namespace: string,
        options: MonitoringTwoFactorOptions
    ): Promise<MonitoringTwoFactorPaginatedObjects<MonitoringTwoFactorUser>>;
    save(fileName: string, items: MonitoringTwoFactorUser[]): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
