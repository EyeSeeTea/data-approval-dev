import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { FilterOrgUnit, getRootIds } from "../../../../domain/common/entities/OrgUnit";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { useAppContext } from "../../../contexts/app-context";
import { OrgUnitChildSelectorButton } from "../../../components/org-units-filter/OrgUnitChildSelectorButton";
import { D2Api } from "@eyeseetea/d2-api/2.34";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange(newFilters: DataSetsFilter): void;
}

export interface DataSetsFilter {
    dataSetIds: Id[];
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus?: string;
    approvalStatus?: string;
}

interface FilterOptions {
    dataSets: NamedRef[];
    periods: string[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;
    const [orgUnits, setOrgUnits] = useState<FilterOrgUnit[]>([]);

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const completionStatusItems = useMemoOptionsFromNamedRef([
        { id: "true", name: "Completed" },
        { id: "false", name: "Not completed" },
    ]);

    const approvalStatusItems = useMemoOptionsFromNamedRef([
        { id: "true", name: "Approved" },
        { id: "false", name: "Ready for approval" },
    ]);

    useEffect(() => {
        async function getOrganisationUnits(api: D2Api, levels: string[]): Promise<FilterOrgUnit[]> {
            const { organisationUnits } = await api.metadata
                .get({
                    organisationUnits: {
                        filter: { level: { in: levels } },
                        fields: {
                            id: true,
                            path: true,
                            name: true,
                            level: true,
                            children: { level: true, path: true },
                        },
                    },
                })
                .getData();

            return _.orderBy(organisationUnits, "level", "asc");
        }

        const levels = ["1", "2", "3"];
        getOrganisationUnits(api, levels).then(value => setOrgUnits(value));
    }, [api]);

    return (
        <Container>
            <OrgUnitChildSelectorButton
                api={api}
                rootIds={rootIds}
                onChange={onChange}
                orgUnitPaths={filter.orgUnitPaths}
                orgUnits={orgUnits}
            />

            <Dropdown
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={dataSetIds => onChange({ ...filter, dataSetIds })}
                label={i18n.t("Data sets")}
            />

            <Dropdown
                items={periodItems}
                values={filter.periods}
                onChange={periods => onChange({ ...filter, periods })}
                label={i18n.t("Periods")}
            />

            <Dropdown
                items={completionStatusItems}
                values={_.compact([filter.completionStatus])}
                onChange={([completionStatus]) => onChange({ ...filter, completionStatus })}
                label={i18n.t("Completion status")}
                multiple={false}
            />

            <Dropdown
                items={approvalStatusItems}
                values={_.compact([filter.approvalStatus])}
                onChange={([approvalStatus]) => onChange({ ...filter, approvalStatus })}
                label={i18n.t("Approval status")}
                multiple={false}
            />
        </Container>
    );
});

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

const Dropdown = styled(MultipleDropdown)`
    margin-left: -10px;
`;
