import { Config } from "../entities/Config";

export interface ConfigRepository {
    get(): Promise<Config>;
}
