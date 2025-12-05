import { ObjectsList, TableConfig, useObjectsTable } from "@eyeseetea/d2-ui-components";
import React, { useMemo, useState } from "react";
import styled from "styled-components";
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
                { name: "scoringSystem", text: i18n.t("Scoring System"), sortable: true },
                { name: "severity", text: i18n.t("Severity"), sortable: true },
                { name: "mortality", text: i18n.t("Mortality"), sortable: true },
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
        <>
            <ObjectsList<SummaryViewModel> {...tableProps} onChangeSearch={undefined} globalActions={[downloadCsv]}>
                <Filters values={filters} options={filterOptions} onChange={setFilters} />
            </ObjectsList>
            <Container>
                <p>*Percentage values are displayed as the percent of total registry cases during period.</p>
                <p>References:</p>
                <ReferenceList>
                    {scoringSystemReferences.map(({ scoringSystem, reference }) => {
                        return (
                            <li key={scoringSystem}>
                                <a href={reference}>{scoringSystem}</a>
                                {}
                            </li>
                        );
                    })}
                </ReferenceList>
            </Container>
        </>
    );
});

function getEmptyDataValuesFilter(): Filter {
    return {
        summaryType: "mortalityInjurySeverity",
        orgUnitPaths: [],
        year: (new Date().getFullYear() - 1).toString(),
        periodType: "yearly",
        quarter: undefined,
    };
}

const scoringSystemReferences = [
    {
        scoringSystem: "GAP",
        reference:
            "https://www.jaypeejournals.com/eJournals/ShowText.aspx?ID=12905&Type=FREE&TYP=TOP&IN=~/eJournals/images/JPLOGO.gif&IID=1004&isPDF=YES",
    },
    {
        scoringSystem: "MGAP",
        reference:
            "https://www.jaypeejournals.com/eJournals/ShowText.aspx?ID=12905&Type=FREE&TYP=TOP&IN=~/eJournals/images/JPLOGO.gif&IID=1004&isPDF=YES",
    },
    {
        scoringSystem: "KTS",
        reference: "https://www.researchgate.net/publication/27799668_Kampala_Trauma_Score_KTS_is_it_a_new_triage_tool",
    },
    {
        scoringSystem: "RTS",
        reference:
            "https://www.jaypeejournals.com/eJournals/ShowText.aspx?ID=12905&Type=FREE&TYP=TOP&IN=~/eJournals/images/JPLOGO.gif&IID=1004&isPDF=YES",
    },
];

const Container = styled.div`
    line-height: 10px;
    margin-bottom: 0;
`;

const ReferenceList = styled.ul`
    list-style-type: none;
    margin: 0;
    padding: 0;
    text-decoration: none;
    display: flex;
    gap: 8px;
    color: #0099de;
`;
