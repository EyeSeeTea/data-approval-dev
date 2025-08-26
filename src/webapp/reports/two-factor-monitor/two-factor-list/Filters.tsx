import React, { useMemo } from "react";
import styled from "styled-components";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import { IconButton } from "material-ui";
import { FilterList } from "@material-ui/icons";
import { useBooleanState } from "../../../utils/use-boolean";
import { MultiSelectorFilterButton } from "../../../components/multi-selector/MultiSelectorFilterButton";
import { NamedRef } from "../../../../domain/common/entities/Ref";

export interface DataSetsFiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    usernameQuery: string;
    groups: string[];
}

interface FilterOptions {
    usernameQuery: string;
    groups: NamedRef[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    const groupItems = useMemoOptionsFromNamedRef(filterOptions.groups);
    const setGroups = React.useCallback(newGroups => onChange(prev => ({ ...prev, groups: newGroups })), [onChange]);
    const selectedUserGroups = filterOptions.groups
        .filter(group => filter.groups.includes(group.id))
        .map(group => group.name)
        .join(", ");
    return (
        <Container>
            <IconButton onClick={openDialog}>
                <FilterList />
            </IconButton>

            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Advanced filters")}
                onCancel={closeDialog}
                cancelText={i18n.t("Close")}
                maxWidth="md"
                fullWidth
            >
                <MultiSelectorFilterButton
                    title="Filter by group"
                    value={selectedUserGroups}
                    selectedItems={filter.groups}
                    options={groupItems}
                    onChange={setGroups}
                />
            </ConfirmationDialog>
        </Container>
    );
});

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
