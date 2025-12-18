import _ from "lodash";
import { DataSet } from "../../common/entities/DataSet";
import { DataSetRepository } from "../../common/repositories/DataSetRepository";
import { DataSetConfiguration } from "../../entities/DataSetConfiguration";
import { Future, FutureData } from "../../generic/Future";
import { DataSetConfigurationRepository } from "../../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../../repositories/UserRepository";

export class UCDataSetConfiguration {
    constructor(
        private options: {
            dataSetConfigurationRepository: DataSetConfigurationRepository;
            userRepository: UserRepository;
            dataSetRepository: DataSetRepository;
        }
    ) {}

    getConfigurations(): FutureData<DataSetConfiguration[]> {
        return this.options.userRepository.getCurrent().flatMap(currentUser => {
            const userGroupCodes = currentUser.userGroups.map(group => group.code);

            return this.options.dataSetConfigurationRepository.getAll().flatMap(dataSetConfigs => {
                // If user is super admin, return all configurations
                if (currentUser.isSuperAdmin) {
                    return Future.success(dataSetConfigs);
                }

                const originDataSetCodes = dataSetConfigs.map(config => config.dataSetOriginalCode);

                return this.getDataSetsByCodes(originDataSetCodes).map(dataSets => {
                    const dsByCodes = _(dataSets)
                        .keyBy(ds => ds.code)
                        .value();

                    // Filter configurations based on user permissions
                    const filteredConfigurations = dataSetConfigs.filter(config => {
                        if (!dsByCodes[config.dataSetOriginalCode]) return false;

                        return config.canUserPerformAction(
                            "read",
                            currentUser.username,
                            userGroupCodes,
                            currentUser.isSuperAdmin
                        );
                    });

                    return filteredConfigurations;
                });
            });
        });
    }

    private getDataSetsByCodes(codes: string[]): FutureData<DataSet[]> {
        return this.options.dataSetRepository.getByCodes(codes);
    }
}
