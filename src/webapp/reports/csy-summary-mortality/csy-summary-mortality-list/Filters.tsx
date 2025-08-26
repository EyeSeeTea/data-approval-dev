import { useMemo, useState } from "react";
import { useAppContext } from "../../../contexts/app-context";
import { Id } from "../../../../domain/common/entities/Base";
import React from "react";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import styled from "styled-components";
import { Dropdown, DropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import _ from "lodash";
import { SummaryType } from "../../../../domain/reports/csy-summary-mortality/entities/SummaryItem";

export interface FiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    summaryType: SummaryType;
    orgUnitPaths: Id[];
    periodType: string;
    year: string;
    quarter?: string;
}

export interface FilterOptions {
    periods: string[];
}

const summaryTypeItems = [
    {
        value: "mortalityInjurySeverity",
        text: i18n.t("Mortality Injury Severity"),
    },
];

export const Filters: React.FC<FiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const [periodType, setPerType] = useState<string>("yearly");

    const rootIds = React.useMemo(
        () =>
            _(config.currentUser.orgUnits)
                .map(ou => ou.id)
                .value(),
        [config]
    );

    const periodTypeItems = React.useMemo(() => {
        return [
            { value: "yearly", text: i18n.t("Yearly") },
            { value: "quarterly", text: i18n.t("Quarterly") },
        ];
    }, []);

    const yearItems = useMemoOptionsFromStrings(filterOptions.periods);

    const quarterPeriodItems = React.useMemo(() => {
        return [
            { value: "Q1", text: i18n.t("Jan - March") },
            { value: "Q2", text: i18n.t("April - June") },
            { value: "Q3", text: i18n.t("July - September") },
            { value: "Q4", text: i18n.t("October - December") },
        ];
    }, []);

    const setSummaryType = React.useCallback<SingleDropdownHandler>(
        summaryType => {
            onChange(filter => ({ ...filter, summaryType: summaryType as SummaryType }));
        },
        [onChange]
    );

    const setQuarterPeriod = React.useCallback<SingleDropdownHandler>(
        quarterPeriod => {
            onChange(filter => ({ ...filter, quarter: quarterPeriod ?? "" }));
        },
        [onChange]
    );

    const setYear = React.useCallback<SingleDropdownHandler>(
        year => {
            onChange(filter => ({ ...filter, year: year ?? "" }));
        },
        [onChange]
    );

    const setPeriodType = React.useCallback<SingleDropdownHandler>(
        periodType => {
            setPerType(periodType ?? "yearly");
            setQuarterPeriod(periodType !== "yearly" ? "Q1" : undefined);

            onChange(filter => ({ ...filter, periodType: periodType ?? "yearly" }));
        },
        [onChange, setQuarterPeriod]
    );

    return (
        <Container>
            <SummaryTypeDropdown
                items={summaryTypeItems}
                value={filter.summaryType}
                onChange={setSummaryType}
                label={i18n.t("Summary Type")}
                hideEmpty
            />

            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={paths => onChange({ ...filter, orgUnitPaths: paths })}
                selectableLevels={[1, 2, 3, 4, 5, 6, 7]}
            />

            <SingleDropdownStyled
                items={periodTypeItems}
                value={filter.periodType}
                onChange={setPeriodType}
                label={i18n.t("Period Type")}
                hideEmpty
            />

            <SingleDropdownStyled
                items={yearItems}
                value={filter.year}
                onChange={setYear}
                label={i18n.t("Year")}
                hideEmpty
            />

            {periodType === "quarterly" && (
                <>
                    <SingleDropdownStyled
                        items={quarterPeriodItems}
                        value={filter.quarter}
                        onChange={setQuarterPeriod}
                        label={i18n.t("Quarter")}
                        hideEmpty
                    />
                </>
            )}
        </Container>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const SummaryTypeDropdown = styled(Dropdown)`
    margin-left: -10px;
    width: 200px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

type SingleDropdownHandler = DropdownProps["onChange"];
