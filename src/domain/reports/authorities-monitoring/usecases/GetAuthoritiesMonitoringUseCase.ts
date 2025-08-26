import { UseCase } from "../../../../compositionRoot";
import {
    AuthoritiesMonitoringItem,
    AuthoritiesMonitoringPaginatedObjects,
} from "../entities/AuthoritiesMonitoringItem";
import {
    AuthoritiesMonitoringOptions,
    AuthoritiesMonitoringRepository,
} from "../repositories/AuthoritiesMonitoringRepository";

export class GetAuthoritiesMonitoringUseCase implements UseCase {
    constructor(private authMonitoringRepository: AuthoritiesMonitoringRepository) {}

    execute(
        namespace: string,
        options: AuthoritiesMonitoringOptions
    ): Promise<AuthoritiesMonitoringPaginatedObjects<AuthoritiesMonitoringItem>> {
        return this.authMonitoringRepository.get(namespace, options);
    }
}
