import _ from "lodash";
import { useMemo } from "react";

export function useSelectablePeriods(useOldPeriods: boolean): string[] {
    const selectablePeriods = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return useOldPeriods
            ? _.range(START_YEAR, currentYear - 5).map(n => n.toString())
            : _.range(currentYear - 5, currentYear + 6).map(n => n.toString());
    }, [useOldPeriods]);

    return selectablePeriods;
}

const START_YEAR = 2000;
