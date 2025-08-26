import { Maybe } from "../../../../types/utils";
import { MonitoringValue } from "../entities/MonitoringValue";

export interface MonitoringValueRepository {
    get(namespace: string): Promise<Maybe<MonitoringValue>>;
    save(namespace: string, monitoring: MonitoringValue): Promise<void>;
}
