import { Id } from "../domain/common/entities/Base";
import { DataSetStatus } from "../domain/common/entities/DataSetStatus";
import { DataSetStatusRepository } from "../domain/common/repositories/DataSetStatusRepository";
import { D2Api } from "../types/d2-api";

export class DataSetStatusD2Repository implements DataSetStatusRepository {
    constructor(private api: D2Api) {}

    async getBy(options: { dataSetId: string; orgUnitId: string; period: string }): Promise<DataSetStatus> {
        const { dataSetId, orgUnitId, period } = options;
        const completeResponse = await this.api
            .request<D2CompleteDataSet>({
                method: "get",
                url: "/completeDataSetRegistrations",
                params: { dataSet: dataSetId, orgUnit: orgUnitId, period: period },
            })
            .getData();

        const isCompleted = completeResponse.completeDataSetRegistrations?.find(
            registration =>
                registration.completed &&
                registration.dataSet === dataSetId &&
                registration.organisationUnit === orgUnitId &&
                registration.period === period
        );

        const submitResponse = await this.api
            .request<D2SubmitDataSet>({
                method: "get",
                url: "/dataApprovals",
                params: { ds: dataSetId, ou: orgUnitId, pe: period },
            })
            .getData();

        return DataSetStatus.create({
            isCompleted: isCompleted?.completed ?? false,
            isSubmitted: submitResponse.state === "APPROVED_HERE" || submitResponse.state === "APPROVED_ELSEWHERE",
        });
    }
}

type D2CompleteDataSet = {
    completeDataSetRegistrations?: Array<{
        period: string;
        dataSet: Id;
        organisationUnit: Id;
        attributeOptionCombo: Id;
        date: string;
        storedBy: string;
        completed: boolean;
    }>;
};

type D2SubmitDataSet = {
    state: "APPROVED_HERE" | "APPROVED_ELSEWHERE";
};
