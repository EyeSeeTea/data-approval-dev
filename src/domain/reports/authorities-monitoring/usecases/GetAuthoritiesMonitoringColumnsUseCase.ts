import { UseCase } from "../../../../compositionRoot";
import { AuthoritiesMonitoringRepository } from "../repositories/AuthoritiesMonitoringRepository";

export class GetAuthoritiesMonitoringColumnsUseCase implements UseCase {
    constructor(private submissionRepository: AuthoritiesMonitoringRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.submissionRepository.getColumns(namespace);
    }
}
