import { ConfigRepository } from "../repositories/ConfigRepository";
import { Config } from "../entities/Config";

export class GetConfig {
    constructor(private configRepository: ConfigRepository) {}

    execute(): Promise<Config> {
        return this.configRepository.get();
    }
}
