import React, { useMemo, useState } from "react";
import { Filter, Filters } from "./Filters";
import { AuditViewModel } from "../AuditViewModel";
import { ObjectsList, TableConfig, useObjectsTable } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import { useAuditReport } from "./useAuditReport";

export const CSYAuditTraumaList: React.FC = React.memo(() => {
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());
    const { auditDefinition, downloadCsv, filterOptions, initialSorting, paginationOptions, getRows } =
        useAuditReport(filters);

    const baseConfig: TableConfig<AuditViewModel> = useMemo(
        () => ({
            columns: [{ name: "registerId", text: i18n.t("Register ID"), sortable: true }],
            actions: [],
            initialSorting: initialSorting,
            paginationOptions: paginationOptions,
        }),
        [initialSorting, paginationOptions]
    );
    const tableProps = useObjectsTable(baseConfig, getRows);

    return (
        <React.Fragment>
            <ObjectsList<AuditViewModel> {...tableProps} onChangeSearch={undefined} globalActions={[downloadCsv]}>
                <div>
                    <Filters values={filters} options={filterOptions} onChange={setFilters} />
                    <p>
                        Audit Definition: <strong>{auditDefinition}</strong>
                    </p>
                </div>
            </ObjectsList>
        </React.Fragment>
    );
});

function getEmptyDataValuesFilter(): Filter {
    return {
        auditType: "mortality",
        orgUnitPaths: [],
        year: (new Date().getFullYear() - 1).toString(),
        periodType: "yearly",
        quarter: undefined,
    };
}
