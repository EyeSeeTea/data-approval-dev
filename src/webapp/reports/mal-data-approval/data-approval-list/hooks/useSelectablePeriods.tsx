import _ from "lodash";
import { useMemo } from "react";
import { DataSetWithConfigPermissions } from "../../../../../domain/usecases/GetApprovalConfigurationsUseCase";

const emptyArray: string[] = [];

export function useSelectablePeriods(
    useOldPeriods: boolean,
    options: { dataSetIds: string[]; dataSetsConfig: DataSetWithConfigPermissions[] }
): string[] {
    const { dataSetIds, dataSetsConfig } = options;
    const firstDataSetId = dataSetIds[0];

    return useMemo(() => {
        if (!firstDataSetId) return emptyArray;

        const periodType = dataSetsConfig.find(ds => ds.dataSet.id === firstDataSetId)?.dataSet.periodType;

        switch (periodType) {
            case "Monthly":
                return generateMonthPeriods(useOldPeriods);
            case "Yearly":
                return generateYearPeriods(useOldPeriods);
            default:
                throw new Error(`Unsupported period type: ${periodType}`);
        }
    }, [firstDataSetId, dataSetsConfig, useOldPeriods]);
}

function generateMonthPeriods(_useOldPeriods: boolean): string[] {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();
    const periods = _.range(0, 12).map(i => {
        const date = new Date(currentYear, currentDate.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${year}${month}`;
    });
    return periods;
}

function generateYearPeriods(useOldPeriods: boolean): string[] {
    const currentYear = new Date().getFullYear();

    return useOldPeriods
        ? _.range(START_YEAR, currentYear - 5).map(n => n.toString())
        : _.range(currentYear - 5, currentYear).map(n => n.toString());
}

const START_YEAR = 2000;
