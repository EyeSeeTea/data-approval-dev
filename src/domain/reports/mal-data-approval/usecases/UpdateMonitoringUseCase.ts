import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { UserGroupRepository } from "../repositories/UserGroupRepository";
import { MonitoringValueRepository } from "../repositories/MonitoringValueRepository";
import { MonitoringValue } from "../entities/MonitoringValue";
import { MalDataSet } from "../../../../data/reports/mal-data-approval/constants/MalDataApprovalConstants";

type UpdateMonitoringUseCaseOptions = {
    namespace: string;
    monitoringValue: MonitoringValue;
    dataApprovalItems: MalDataApprovalItemIdentifier[];
    dataSetName: MalDataSet;
    enableMonitoring: boolean;
};

export class UpdateMonitoringUseCase implements UseCase {
    constructor(
        private monitoringValueRepository: MonitoringValueRepository,
        private userGroupRepository: UserGroupRepository
    ) {}

    async execute(options: UpdateMonitoringUseCaseOptions): Promise<void> {
        const { namespace, monitoringValue, dataApprovalItems, dataSetName, enableMonitoring } = options;

        const dataNotificationsUserGroup = await this.userGroupRepository.getUserGroupByCode(
            malDataNotificationsUserGroup
        );
        const updatedMonitoringValue = buildMonitoringValue(
            monitoringValue,
            dataApprovalItems,
            dataSetName,
            dataNotificationsUserGroup.id,
            enableMonitoring
        );

        return this.monitoringValueRepository.save(namespace, updatedMonitoringValue);
    }
}

function buildMonitoringValue(
    monitoringValue: MonitoringValue,
    dataApprovalItems: MalDataApprovalItemIdentifier[],
    dataSetName: MalDataSet,
    dataNotificationsUserGroup: string,
    enableMonitoring: boolean
): MonitoringValue {
    const updatedMonitoringValue: MonitoringValue = {
        ...monitoringValue,
        dataSets: {
            ...monitoringValue.dataSets,
            [dataSetName]: monitoringValue.dataSets[dataSetName]?.map(dataSet => {
                return dataApprovalItems.map(dataApprovalItem => {
                    const matchingMonitoringItem = dataSet.monitoring.find(
                        monitoringItem =>
                            monitoringItem.orgUnit === dataApprovalItem.orgUnitCode &&
                            monitoringItem.period === dataApprovalItem.period
                    );

                    return {
                        ...dataSet,
                        monitoring: !matchingMonitoringItem
                            ? [
                                  ...dataSet.monitoring,
                                  {
                                      orgUnit: dataApprovalItem.orgUnitCode,
                                      period: dataApprovalItem.period,
                                      enable: enableMonitoring,
                                  },
                              ]
                            : [
                                  ...dataSet.monitoring.filter(
                                      monitoringItem =>
                                          monitoringItem.orgUnit !== dataApprovalItem.orgUnitCode &&
                                          monitoringItem.period !== dataApprovalItem.period
                                  ),
                                  { ...matchingMonitoringItem, enable: enableMonitoring },
                              ],
                        userGroups: [dataNotificationsUserGroup],
                    };
                });
            }),
        },
    };

    return updatedMonitoringValue;
}

const malDataNotificationsUserGroup = "NHWA administrators";
