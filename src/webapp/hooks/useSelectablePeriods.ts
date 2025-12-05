import _ from "lodash";
import React from "react";

export function useSelectablePeriods(startYear: number): string[] {
    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(startYear, currentYear + 1).map(year => year.toString());
    }, [startYear]);

    return selectablePeriods;
}
