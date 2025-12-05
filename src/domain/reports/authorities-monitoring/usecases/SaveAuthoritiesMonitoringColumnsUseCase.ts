import { UseCase } from "../../../../compositionRoot";
import { AuthoritiesMonitoringRepository } from "../repositories/AuthoritiesMonitoringRepository";

export class SaveAuthoritiesMonitoringColumnsUseCase implements UseCase {
    constructor(private submissionRepository: AuthoritiesMonitoringRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.submissionRepository.saveColumns(namespace, columns);
    }
}
