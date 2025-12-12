import { DataSetConfiguration } from "../entities/DataSetConfiguration";
import { Future, FutureData } from "../generic/Future";
import { DataSetConfigurationRepository } from "../repositories/DataSetConfigurationRepository";
import { UserRepository } from "../repositories/UserRepository";

export class SaveDataSetConfigurationUseCase {
    constructor(
        private options: {
            dataSetConfigurationRepository: DataSetConfigurationRepository;
            userRepository: UserRepository;
        }
    ) {}

    execute(configuration: DataSetConfiguration): FutureData<void> {
        const dsAreEqual = configuration.dataSetsAreEqual();
        if (dsAreEqual) {
            return Future.error(new Error("The original and destination DataSet cannot be the same"));
        }

        return this.options.userRepository.getCurrent().flatMap(currentUser => {
            if (!currentUser.isSuperAdmin) {
                return Future.error(new Error("Only super administrators can save DataSet configurations"));
            }

            return this.checkDuplicate(configuration).flatMap(isDuplicate => {
                if (isDuplicate) {
                    return Future.error(new Error("A configuration with the same code already exists"));
                } else {
                    return this.options.dataSetConfigurationRepository.save(configuration);
                }
            });
        });
    }

    private checkDuplicate(configuration: DataSetConfiguration): FutureData<boolean> {
        return this.options.dataSetConfigurationRepository
            .getByCode(configuration.id)
            .map(existing => {
                return existing.id !== configuration.id;
            })
            .flatMapError(() => Future.success(false));
    }
}
