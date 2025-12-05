import React, { useMemo, useState } from "react";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";
import { Id } from "../../../../domain/common/entities/Base";
import styled from "styled-components";
import { Dropdown, DropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import _ from "lodash";
import { AuditType } from "../../../../domain/reports/csy-audit-emergency/entities/AuditItem";

export interface FiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    auditType: AuditType;
    orgUnitPaths: Id[];
    periodType: string;
    year: string;
    quarter?: string;
}

export type FilterOptions = {
    periods: string[];
};

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

    const setAuditType = React.useCallback<SingleDropdownHandler>(
        auditType => {
            onChange(filter => ({ ...filter, auditType: auditType as AuditType }));
        },
        [onChange]
    );

    const setQuarterPeriod = React.useCallback<SingleDropdownHandler>(
        quarterPeriod => {
            onChange(filter => ({ ...filter, quarter: quarterPeriod ?? "" }));
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

    const setYear = React.useCallback<SingleDropdownHandler>(
        year => {
            onChange(filter => ({ ...filter, year: year ?? "" }));
        },
        [onChange]
    );

    return (
        <Container>
            <AuditTypeDropdown
                items={auditTypeItems}
                value={filter.auditType}
                onChange={setAuditType}
                label={i18n.t("Audit Type")}
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

export const auditTypeItems = [
    {
        value: "overallMortality",
        text: i18n.t("Overall Mortality in EU"),
        auditDefinition: i18n.t("ETA_EU Dispo = Morgue or Died or ETA_Facility Dispo = Morgue or Died"),
    },
    {
        value: "lowAcuity",
        text: i18n.t("Low acuity triage with EU disposition ICU"),
        auditDefinition: i18n.t("EU dispo = ICU AND Triage category = lowest acuity triage category"),
    },
    {
        value: "highestTriage",
        text: i18n.t("Highest triage category and time to first provider >30min​"),
        auditDefinition: i18n.t(
            "Triage category = highest category AND time between EU arrival date and time  to Date and time seen by a  first treating provider > 30 min"
        ),
    },
    {
        value: "initialRbg",
        text: i18n.t("Initial RBG low and Glucose not given"),
        auditDefinition: i18n.t("Initial RBG = Low AND Glucose not given at EU"),
    },
    {
        value: "shockIvf",
        text: i18n.t("Shock and IVF including Blood"),
        auditDefinition: i18n.t(
            "(Age>=16 OR Age category = adult - age unknown) AND Initial SBP<90mmHg AND  (Section: Emergency Unit Interventions > Medications and Fluids) IV Fluids = not done",
            { nsSeparator: false }
        ),
    },
];

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

const AuditTypeDropdown = styled(Dropdown)`
    margin-left: -10px;
    width: 420px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

type SingleDropdownHandler = DropdownProps["onChange"];
