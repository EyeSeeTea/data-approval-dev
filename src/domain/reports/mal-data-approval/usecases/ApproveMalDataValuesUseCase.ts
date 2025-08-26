import _ from "lodash";
import { UseCase } from "../../../../compositionRoot";
import { DataValueStats } from "../../../common/entities/DataValueStats";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { dataSetApprovalName } from "../../WmrDiffReport";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class ApproveMalDataValuesUseCase implements UseCase {
    constructor(private dataSetRepository: DataSetRepository, private approvalRepository: MalDataApprovalRepository) {}

    async execute(items: DataDiffItemIdentifier[]): Promise<DataValueStats[]> {
        const approvalDataSet = await this.dataSetRepository.getByNameOrCode(dataSetApprovalName);
        const assignedOrgUnitIds = approvalDataSet.organisationUnits.map(ou => ou.id);
        const dataValuesOrgUnitIds = _(items)
            .map(item => item.orgUnit)
            .uniq()
            .value();

        const nonAssignedOrgUnits = _.difference(dataValuesOrgUnitIds, assignedOrgUnitIds);
        const notAssignedOrgUnitsStast = nonAssignedOrgUnits.map(orgUnitId => {
            return new DataValueStats({
                imported: 0,
                updated: 0,
                ignored: 0,
                deleted: 0,
                period: "",
                orgUnitId: orgUnitId,
                dataSetId: approvalDataSet.id,
                errorMessages: [
                    { message: `Org unit ${orgUnitId} is not assigned to the approval dataSet ${approvalDataSet.id}` },
                ],
                strategy: "SAVE",
            });
        });

        const dataValuesWithoutNonAssignedOrgUnits =
            nonAssignedOrgUnits.length > 0
                ? items.filter(item => (nonAssignedOrgUnits.includes(item.orgUnit) ? false : true))
                : items;

        const stats = await this.approvalRepository.replicateDataValuesInApvdDataSet(
            dataValuesWithoutNonAssignedOrgUnits
        );

        return stats.concat(notAssignedOrgUnitsStast);
    }
}

export type ApproveMalDataValuesOptions = {
    items: DataDiffItemIdentifier[];
    approvalDataSetId: string;
};
