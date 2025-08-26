import { UseCase } from "../../../../compositionRoot";
import { MonitoringValue } from "../entities/MonitoringValue";
import { MonitoringValueRepository } from "../repositories/MonitoringValueRepository";

export class GetMonitoringUseCase implements UseCase {
    constructor(private monitoringValueRepositpry: MonitoringValueRepository) {}

    execute(namespace: string): Promise<MonitoringValue | undefined> {
        return this.monitoringValueRepositpry.get(namespace);
    }
}
