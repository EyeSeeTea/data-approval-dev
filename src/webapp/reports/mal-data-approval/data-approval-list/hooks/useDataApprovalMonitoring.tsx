import { useCallback, useEffect, useState } from "react";
import { MalDataApprovalItemIdentifier } from "../../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { Namespaces } from "../../../../../data/common/clients/storage/Namespaces";
import { useAppContext } from "../../../../contexts/app-context";
import _ from "lodash";
import { MonitoringValue } from "../../../../../domain/reports/mal-data-approval/entities/MonitoringValue";
import { MalDataSet } from "../../../../../data/reports/mal-data-approval/constants/MalDataApprovalConstants";

export function useDataApprovalMonitoring() {
    const { compositionRoot, config } = useAppContext();
    const [monitoringValue, setMonitoringValue] = useState<MonitoringValue>();

    useEffect(() => {
        compositionRoot.malDataApproval.getMonitoring(Namespaces.MONITORING).then(setMonitoringValue);
    }, [compositionRoot.malDataApproval]);

    const saveMonitoring = useCallback(
        async (items: MalDataApprovalItemIdentifier[], enableMonitoring: boolean) => {
            const dataSetName = _.values(config.dataSets).find(dataSet =>
                items.map(item => item.dataSet).includes(dataSet.id)
            )?.name;

            if (!monitoringValue) return;
            if (!dataSetName) throw new Error("Data set not found");

            return await compositionRoot.malDataApproval.updateMonitoring({
                namespace: Namespaces.MONITORING,
                monitoringValue: monitoringValue,
                dataApprovalItems: items,
                dataSetName: dataSetName as MalDataSet,
                enableMonitoring: enableMonitoring,
            });
        },
        [compositionRoot.malDataApproval, config.dataSets, monitoringValue]
    );

    return {
        saveMonitoring: saveMonitoring,
    };
}
