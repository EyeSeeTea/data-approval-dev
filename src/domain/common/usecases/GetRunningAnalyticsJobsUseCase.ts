import { FutureData } from "../../generic/Future";
import { AnalyticsJob } from "../entities/AnalyticsJob";
import { AnalyticsJobRepository } from "../repositories/AnalyticsJobRepository";

export class GetRunningAnalyticsJobsUseCase {
    constructor(private options: { analyticsJobRepository: AnalyticsJobRepository }) {}

    public execute(): FutureData<ReadonlyArray<AnalyticsJob>> {
        return this.options.analyticsJobRepository.getRunning();
    }
}
