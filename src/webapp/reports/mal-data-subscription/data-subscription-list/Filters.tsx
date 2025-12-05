import { Dropdown, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import styled from "styled-components";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { NamedRef } from "../../../../domain/common/entities/Base";
import { ElementType } from "../../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";

export interface DataSubscriptionFiltersProps {
    values: DataSubscriptionFilter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<DataSubscriptionFilter>>;
}

export interface DataSubscriptionFilter {
    elementType: ElementType;
    dataElementIds: string[];
    sections: string[];
    subscriptionStatus: string | undefined;
    dataElementGroups: string[];
}

interface FilterOptions {
    dataElementGroups: NamedRef[];
    sections: NamedRef[];
    subscription: string[];
}

export const Filters: React.FC<DataSubscriptionFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;

    const sectionItems = useMemoOptionsFromNamedRef(filterOptions.sections);
    const dataElementGroupItems = useMemoOptionsFromNamedRef(filterOptions.dataElementGroups);
    const elementTypeItems = React.useMemo(() => {
        return [
            { value: "dataElements", text: i18n.t("Data Elements") },
            { value: "dashboards", text: i18n.t("Dashboards") },
            { value: "visualizations", text: i18n.t("Visualizations") },
        ];
    }, []);

    const subscriptionItems = useMemoOptionsFromStrings(filterOptions.subscription);
    const subscriptionTypeItems =
        filter.elementType !== "dataElements"
            ? subscriptionItems
            : subscriptionItems.filter(subscriptionItem => subscriptionItem.value !== "Subscribed to some elements");

    const setSections = React.useCallback<DropdownHandler>(
        sections => onChange(prev => ({ ...prev, sections })),
        [onChange]
    );

    const setDataElementGroups = React.useCallback<DropdownHandler>(
        dataElementGroups => onChange(prev => ({ ...prev, dataElementGroups })),
        [onChange]
    );

    const setElementType = React.useCallback<SingleDropdownHandler>(
        elementType => onChange(prev => ({ ...prev, elementType: (elementType as ElementType) ?? "dataElements" })),
        [onChange]
    );

    const setSubscriptionStatus = React.useCallback<SingleDropdownHandler>(
        subscriptionStatus => onChange(prev => ({ ...prev, subscriptionStatus })),
        [onChange]
    );

    return (
        <Container>
            <SingleDropdownStyled
                items={elementTypeItems}
                value={filter.elementType}
                onChange={setElementType}
                label={i18n.t("Element Type")}
                hideEmpty
            />

            <SingleDropdownStyled
                items={subscriptionTypeItems}
                value={filter.subscriptionStatus}
                onChange={setSubscriptionStatus}
                label={i18n.t("Subscription Status")}
            />

            {filter.elementType === "dataElements" && (
                <DropdownStyled
                    items={sectionItems}
                    values={filter.sections}
                    onChange={setSections}
                    label={i18n.t("Section")}
                />
            )}

            {filter.elementType === "dataElements" && (
                <DropdownStyled
                    items={dataElementGroupItems}
                    values={filter.dataElementGroups}
                    onChange={setDataElementGroups}
                    label={i18n.t("Data Element Groups")}
                />
            )}
        </Container>
    );
});

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
