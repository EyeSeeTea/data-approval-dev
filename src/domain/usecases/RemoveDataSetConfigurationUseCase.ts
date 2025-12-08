import { Future, FutureData } from "../generic/Future";
import { DataSetConfigurationRepository } from "../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../repositories/UserRepository";

export class RemoveDataSetConfigurationUseCase {
    constructor(
        private options: {
            dataSetConfigurationRepository: DataSetConfigurationRepository;
            userRepository: UserRepository;
        }
    ) {}

    execute(id: string): FutureData<void> {
        return this.options.userRepository.getCurrent().flatMap(currentUser => {
            if (!currentUser.isSuperAdmin) {
                return Future.error(new Error("Only super administrators can remove DataSet configurations"));
            }

            return this.options.dataSetConfigurationRepository.remove(id);
        });
    }
}
