import React, { useMemo, useState } from "react";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";
import { Id } from "../../../../domain/common/entities/Base";
import styled from "styled-components";
import { Dropdown, DropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import _ from "lodash";
import { AuditType } from "../../../../domain/reports/csy-audit-trauma/entities/AuditItem";

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

export const auditTypeItems = [
    {
        value: "mortality",
        text: i18n.t("Mortality with low injury severity score"),
        auditDefinition: i18n.t(
            "(EU Disposition = Death) OR (Hospital Disposition = Death) AND (KTS=14-16) OR (MGAP=23-29) OR (GAP=19-24) OR (RTS=11-12)"
        ),
    },
    {
        value: "hypoxia",
        text: i18n.t("Oxygen not administered for patients with hypoxia"),
        auditDefinition: i18n.t("Initial Oxygen Sat < 92 AND EU Procedures != Supplemental Oxygen Administration"),
    },
    {
        value: "tachypnea",
        text: i18n.t("Oxygen not administered for patients with tachypnea"),
        auditDefinition: i18n.t(
            "Initial Spontaneous RR <12 OR >30 AND EU Procedures != Supplemental Oxygen Administration"
        ),
    },
    {
        value: "mental",
        text: i18n.t("Mental status-dependent airway maneuver"),
        auditDefinition: i18n.t(
            "GCS total < 8 OR AVPU=(P OR U) AND EU Procedures ≠ Endotracheal intubation, Surgical airway, OR Assisted Ventilation"
        ),
    },
    {
        value: "allMortality",
        text: i18n.t("All mortality"),
        auditDefinition: i18n.t("EU Disposition = Mortuary or Died OR Hospital Disposition = Morgue or Died"),
    },
    {
        value: "emergencyUnit",
        text: i18n.t("Emergency Unit"),
        auditDefinition: i18n.t("EU Disposition = Mortuary or Died"),
    },
    {
        value: "hospitalMortality",
        text: i18n.t("Hospital Mortality"),
        auditDefinition: i18n.t("Hospital Disposition = Morgue or Died"),
    },
    {
        value: "severeInjuries",
        text: i18n.t("Severe injuries by any scoring system"),
        auditDefinition: i18n.t("(KTS<11) OR (MGAP=3-17) OR (GAP=3-10) OR (RTS≤3)"),
    },
    {
        value: "moderateSevereInjuries",
        text: i18n.t("Moderate or severe injuries by any scoring system"),
        auditDefinition: i18n.t("(KTS≤13) OR (MGAP≤22) OR (GAP≤18) OR (RTS≤10)"),
    },
    {
        value: "moderateInjuries",
        text: i18n.t("Moderate injuries by any scoring system"),
        auditDefinition: i18n.t("(KTS=11-13) OR (MGAP=18-22) OR (GAP=11-18) OR (RTS=4-10)"),
    },
];
