import { DataSetConfiguration } from "../../entities/DataSetConfiguration";
import { FutureData } from "../../generic/Future";
import { DataSetConfigurationRepository } from "../../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../../repositories/UserRepository";

export class UCDataSetConfiguration {
    constructor(
        private options: {
            dataSetConfigurationRepository: DataSetConfigurationRepository;
            userRepository: UserRepository;
        }
    ) {}

    getConfigurations(): FutureData<DataSetConfiguration[]> {
        return this.options.userRepository.getCurrent().flatMap(currentUser => {
            const userGroupCodes = currentUser.userGroups.map(group => group.code);

            return this.options.dataSetConfigurationRepository.getAll().map(dataSetConfigs => {
                // If user is super admin, return all configurations
                if (currentUser.isSuperAdmin) {
                    return dataSetConfigs;
                }

                // Filter configurations based on user permissions
                const filteredConfigurations = dataSetConfigs.filter(config => {
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
    }
}
