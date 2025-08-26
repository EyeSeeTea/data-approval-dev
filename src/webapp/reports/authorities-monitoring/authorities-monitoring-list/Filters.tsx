import React, { useMemo } from "react";
import styled from "styled-components";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import _ from "lodash";
import { IconButton } from "material-ui";
import { FilterList } from "@material-ui/icons";
import { useBooleanState } from "../../../utils/use-boolean";
import { MultiSelectorFilterButton } from "../../../components/multi-selector/MultiSelectorFilterButton";
import { NamedRef } from "../../../../domain/common/entities/Ref";
import { UserRole } from "../../../../domain/reports/authorities-monitoring/entities/UserPermissions";

export interface DataSetsFiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    usernameQuery: string;
    templateGroups: string[];
    userRoles: string[];
}

interface FilterOptions {
    usernameQuery: string;
    templateGroups: string[];
    userRoles: UserRole[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    const templateGroupItems = useMemoOptionsFromStrings(filterOptions.templateGroups);
    const userRoleItems = useMemoOptionsFromNamedRef(filterOptions.userRoles);

    const setTemplateGroups = React.useCallback(
        templateGroups => onChange(prev => ({ ...prev, templateGroups })),
        [onChange]
    );
    const setUserRoles = React.useCallback(userRoles => onChange(prev => ({ ...prev, userRoles })), [onChange]);

    const selectedUserRoles = filterOptions.userRoles
        .filter(role => filter.userRoles.includes(role.id))
        .map(role => role.name)
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
                    title="Filter by template group"
                    selectedItems={filter.templateGroups}
                    options={templateGroupItems}
                    onChange={setTemplateGroups}
                />

                <MultiSelectorFilterButton
                    title="Filter by user role"
                    value={selectedUserRoles}
                    selectedItems={filter.userRoles}
                    options={userRoleItems}
                    onChange={setUserRoles}
                />
            </ConfirmationDialog>
        </Container>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return _(options)
            .map(option => ({ value: option, text: option }))
            .value();
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
