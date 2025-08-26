import { DataValue, DataValuesSelector, DataValueToPost } from "../entities/DataValue";
import { Stats } from "../entities/Stats";

export interface DataValuesRepository {
    get(options: DataValuesSelector): Promise<DataValue[]>;
    saveAll(dataValues: DataValueToPost[]): Promise<Stats>;
    deleteAll(dataValues: DataValueToPost[]): Promise<Stats>;
}
