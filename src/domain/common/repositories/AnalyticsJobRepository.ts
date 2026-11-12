import { AnalyticsJob } from "../entities/AnalyticsJob";
import { FutureData } from "../../generic/Future";

export interface AnalyticsJobRepository {
    getRunning(): FutureData<ReadonlyArray<AnalyticsJob>>;
}
