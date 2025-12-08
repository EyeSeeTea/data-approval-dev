import { DataSet } from "../common/entities/DataSet";
import { DataSetRepository } from "../common/repositories/DataSetRepository";
import { DataSetConfiguration } from "../entities/DataSetConfiguration";
import { FutureData } from "../generic/Future";
import { DataSetConfigurationRepository } from "../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../repositories/UserRepository";
import { UCDataSetConfiguration } from "./helpers/UCDataSetConfiguration";
import _ from "../generic/Collection";
import { Maybe } from "../../types/utils";

export class GetApprovalConfigurationsUseCase {
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
        });
    }

    execute(): FutureData<DataSetWithConfigPermissions[]> {
        return this.UCDataSetConfiguration.getConfigurations().flatMap(configurations => {
            const dataSetCodes = configurations.map(config => config.dataSetOriginalCode);

            return this.getDataSets(dataSetCodes).map(dataSets => {
                return _(dataSets)
                    .compactMap((dataSet): Maybe<DataSetWithConfigPermissions> => {
                        const config = configurations.find(config => config.dataSetOriginalCode === dataSet.code);
                        if (!config) return undefined;

                        return { configuration: config, dataSet: dataSet };
                    })
                    .value();
            });
        });
    }

    private getDataSets(codes: string[]): FutureData<DataSet[]> {
        return this.options.dataSetRepository.getByCodes(codes);
    }
}

export type DataSetWithConfigPermissions = {
    dataSet: DataSet;
    configuration: DataSetConfiguration;
};
