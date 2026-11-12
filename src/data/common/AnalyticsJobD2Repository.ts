import { D2Api } from "../../types/d2-api";
import { FutureData } from "../../domain/generic/Future";
import { AnalyticsJob } from "../../domain/common/entities/AnalyticsJob";
import { AnalyticsJobRepository } from "../../domain/common/repositories/AnalyticsJobRepository";
import { apiToFuture } from "../api-futures";

// Job types that drop and rebuild the analytics and resource tables while they run. A job started
// by hand from Data Administration is also stored as a job configuration, so it is found too.
const analyticsJobTypes = ["ANALYTICS_TABLE", "RESOURCE_TABLE", "CONTINUOUS_ANALYTICS_TABLE"] as const;

export class AnalyticsJobD2Repository implements AnalyticsJobRepository {
    constructor(private api: D2Api) {}

    getRunning(): FutureData<ReadonlyArray<AnalyticsJob>> {
        return apiToFuture(
            this.api.models.jobConfigurations.get({
                fields: { id: true, name: true },
                filter: { jobStatus: { eq: "RUNNING" }, jobType: { in: [...analyticsJobTypes] } },
                paging: false,
            })
        ).map(response => response.objects.map(job => AnalyticsJob.create({ id: job.id, name: job.name })));
    }
}
