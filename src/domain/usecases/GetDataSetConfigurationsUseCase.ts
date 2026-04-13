import { DataSetRepository } from "../common/repositories/DataSetRepository";
import { DataSetConfiguration } from "../entities/DataSetConfiguration";
import { FutureData } from "../generic/Future";
import { DataSetConfigurationRepository } from "../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../repositories/UserRepository";
import { UCDataSetConfiguration } from "./helpers/UCDataSetConfiguration";

export class GetDataSetConfigurationsUseCase {
    private UCDataSetConfiguration: UCDataSetConfiguration;
    constructor(
        private options: {
            dataSetConfigurationRepository: DataSetConfigurationRepository;
            userRepository: UserRepository;
            dataSetRepository: DataSetRepository;
        }
    ) {
        this.UCDataSetConfiguration = new UCDataSetConfiguration({
            dataSetConfigurationRepository: this.options.dataSetConfigurationRepository,
            userRepository: this.options.userRepository,
            dataSetRepository: this.options.dataSetRepository,
        });
    }

    execute(): FutureData<DataSetConfiguration[]> {
        return this.UCDataSetConfiguration.getConfigurations();
    }
}
