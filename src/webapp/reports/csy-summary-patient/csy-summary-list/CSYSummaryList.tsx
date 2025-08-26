import { ObjectsList, TableConfig, useObjectsTable } from "@eyeseetea/d2-ui-components";
import React, { useMemo, useState } from "react";
import { SummaryViewModel } from "../SummaryViewModel";
import i18n from "../../../../locales";
import { Filter, Filters } from "./Filters";
import { useSummaryReport } from "./useSummaryReport";

export const CSYSummaryList: React.FC = React.memo(() => {
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());
    const { downloadCsv, filterOptions, initialSorting, paginationOptions, getRows } = useSummaryReport(filters);

    const baseConfig: TableConfig<SummaryViewModel> = useMemo(
        () => ({
            columns: [
                { name: "group", text: i18n.t("Group"), sortable: false },
                { name: "subGroup", text: i18n.t("Sub-Group"), sortable: true },
                { name: "yearLessThan1", text: i18n.t("< 1 yr"), sortable: true },
                { name: "year1To4", text: i18n.t("1 - 4 yr"), sortable: true },
                { name: "year5To9", text: i18n.t("5 - 9 yr"), sortable: true },
                { name: "year10To14", text: i18n.t("10 - 14 yr"), sortable: true },
                { name: "year15To19", text: i18n.t("15 - 19 yr"), sortable: true },
                { name: "year20To40", text: i18n.t("20 - 40 yr"), sortable: true },
                { name: "year40To60", text: i18n.t("40 - 60 yr"), sortable: true },
                { name: "year60To80", text: i18n.t("60 - 80 yr"), sortable: true },
                { name: "yearGreaterThan80", text: i18n.t("80+ yr"), sortable: true },
                { name: "unknown", text: i18n.t("Unknown"), sortable: true },
                { name: "total", text: i18n.t("Total"), sortable: true },
            ],
            actions: [],
            initialSorting: initialSorting,
            paginationOptions: paginationOptions,
        }),
        [initialSorting, paginationOptions]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    return (
        <ObjectsList<SummaryViewModel> {...tableProps} onChangeSearch={undefined} globalActions={[downloadCsv]}>
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getEmptyDataValuesFilter(): Filter {
    return {
        summaryType: "patientCharacteristics",
        orgUnitPaths: [],
        year: (new Date().getFullYear() - 1).toString(),
        periodType: "yearly",
        quarter: undefined,
    };
}
