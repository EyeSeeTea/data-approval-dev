import { DataSetConfiguration } from "../entities/DataSetConfiguration";
import { Future, FutureData } from "../generic/Future";
import { DataSetConfigurationRepository } from "../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../repositories/UserRepository";

export class GetDataSetConfigurationByCodeUseCase {
    constructor(
        private options: {
            dataSetConfigurationRepository: DataSetConfigurationRepository;
            userRepository: UserRepository;
        }
    ) {}

    execute(options: { id: string }): FutureData<DataSetConfiguration> {
        const { id } = options;
        return this.options.userRepository.getCurrent().flatMap(currentUser => {
            const userGroupIds = currentUser.userGroups.map(group => group.code);

            return this.options.dataSetConfigurationRepository.getByCode(id).flatMap(dataSetConfig => {
                if (currentUser.isSuperAdmin) {
                    return Future.success(dataSetConfig);
                }

                const hasPermission = dataSetConfig.canUserPerformAction(
                    "read",
                    currentUser.username,
                    userGroupIds,
                    currentUser.isSuperAdmin
                );

                if (!hasPermission) {
                    return Future.error(new Error("You do not have permission to access this DataSet configuration"));
                }

                return Future.success(dataSetConfig);
            });
        });
    }
}
