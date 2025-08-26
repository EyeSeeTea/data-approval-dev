import React, { useMemo } from "react";
import styled from "styled-components";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { Id } from "../../../../domain/common/entities/Base";
import { useAppContext } from "../../../contexts/app-context";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { Dropdown, DatePicker } from "@eyeseetea/d2-ui-components";
import {
    DataSubmissionPeriod,
    Module,
    Status,
} from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { useDataSubmissionList } from "./useDataSubmissionList";
import { Button } from "@material-ui/core";
import useDataSubmissionFilters from "./useDataSubmissionFilters";
import { NamedRef } from "../../../../domain/common/entities/Ref";

export interface DataSubmissionFilterProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
    dataSubmissionPeriod?: DataSubmissionPeriod;
    isEARModule?: boolean;
}

export interface Filter {
    module: Module | undefined;
    orgUnitPaths: Id[];
    periods: string[];
    quarters: string[];
    from: Date | undefined;
    to: Date | undefined;
    completionStatus?: boolean;
    submissionStatus?: Status;
}

interface FilterOptions {
    periods: string[];
}

export const statusItems = [
    { value: "NOT_COMPLETED", text: i18n.t("Not Completed") },
    { value: "COMPLETE", text: i18n.t("Data to be approved by country") },
    { value: "PENDING_APPROVAL", text: i18n.t("Waiting WHO Approval") },
    { value: "REJECTED", text: i18n.t("Rejected By WHO") },
    { value: "APPROVED", text: i18n.t("Approved") },
    { value: "UPDATE_REQUEST_ACCEPTED", text: i18n.t("Data update request accepted") },
    { value: "PENDING_UPDATE_APPROVAL", text: i18n.t("Waiting for WHO to approve your update request") },
];

export const earStatusItems = [
    { value: "DRAFT", text: i18n.t("Draft") },
    { value: "PENDING_APPROVAL", text: i18n.t("Waiting WHO Approval") },
    { value: "REJECTED", text: i18n.t("Rejected By WHO") },
    { value: "APPROVED", text: i18n.t("Approved") },
];

export const Filters: React.FC<DataSubmissionFilterProps> = React.memo(props => {
    const { api } = useAppContext();
    const { values: filter, options: filterOptions } = props;

    const { dataSubmissionPeriod, isEARModule, userModules } = useDataSubmissionList(filter);
    const { applyFilters, clearFilters, rootIds, filterValues, setFilterValues } = useDataSubmissionFilters(props);

    const moduleItems = useMemoOptionsFromNamedRef(userModules);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const quarterItems = useMemo(() => {
        return [
            { value: "Q1", text: i18n.t("January-March") },
            { value: "Q2", text: i18n.t("April-June") },
            { value: "Q3", text: i18n.t("July-September") },
            { value: "Q4", text: i18n.t("October-December") },
        ];
    }, []);

    const completionStatusItems = useMemo(() => {
        return [
            { value: "true", text: i18n.t("Completed") },
            { value: "false", text: i18n.t("Not completed") },
        ];
    }, []);

    const submissionStatusItems = useMemo(() => statusItems, []);
    const earSubmissionStatusItems = useMemo(() => earStatusItems, []);

    return (
        <>
            <Container>
                <SingleDropdownStyled
                    items={moduleItems}
                    value={filterValues.module}
                    onChange={setFilterValues.module}
                    label={i18n.t("Module")}
                />

                <OrgUnitsFilterButton
                    api={api}
                    rootIds={rootIds}
                    selected={filterValues.orgUnitPaths}
                    setSelected={setFilterValues.orgUnitPaths}
                    selectableLevels={[1, 2, 3]}
                />

                {!isEARModule ? (
                    <DropdownStyled
                        items={periodItems}
                        values={filterValues.periods}
                        onChange={setFilterValues.periods}
                        label={i18n.t("Years")}
                    />
                ) : (
                    <>
                        <DatePickerStyled
                            label="From"
                            value={filterValues.from ?? null}
                            maxDate={filterValues.to}
                            onChange={setFilterValues.startDate}
                        />
                        <DatePickerStyled
                            label="To"
                            value={filterValues.to ?? null}
                            minDate={filterValues.from}
                            maxDate={new Date()}
                            onChange={setFilterValues.endDate}
                        />
                    </>
                )}

                {dataSubmissionPeriod === "QUARTERLY" && (
                    <DropdownStyled
                        items={quarterItems}
                        values={filterValues.quarters}
                        onChange={setFilterValues.quarters}
                        label={i18n.t("Quarters")}
                    />
                )}

                {!isEARModule && (
                    <SingleDropdownStyled
                        items={completionStatusItems}
                        value={fromBool(filterValues.completionStatus)}
                        onChange={setFilterValues.completionStatus}
                        label={i18n.t("Questionnaire completed")}
                    />
                )}

                <SingleDropdownStyled
                    items={isEARModule ? earSubmissionStatusItems : submissionStatusItems}
                    value={filterValues.submissionStatus}
                    onChange={setFilterValues.submissionStatus}
                    label={i18n.t("Status")}
                />
            </Container>

            <FilterButtonContainer>
                <Button disabled={!filterValues.module} onClick={applyFilters} variant="contained" color="primary">
                    {i18n.t("Apply filters")}
                </Button>

                <Button onClick={clearFilters} variant="contained">
                    {i18n.t("Clear filters")}
                </Button>
            </FilterButtonContainer>
        </>
    );
});

export const emptySubmissionFilter: Filter = {
    module: undefined,
    orgUnitPaths: [],
    periods: [],
    quarters: ["Q1"],
    from: undefined,
    to: undefined,
    completionStatus: undefined,
    submissionStatus: undefined,
};

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const FilterButtonContainer = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: end;
    width: 100%;
`;

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 250px;
`;

const DatePickerStyled = styled(DatePicker)`
    margin-top: -8px;
`;

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}
