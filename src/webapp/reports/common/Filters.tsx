import React from "react";
import styled from "styled-components";
import { MultipleDropdown, useSnackbar } from "@eyeseetea/d2-ui-components";
import { OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { defaultPeriods } from "./nhwa-settings";
import { D2Api } from "./../../../types/d2-api";
import i18n from "../../../locales";
import { OrgUnitChildSelectorButton } from "../../components/org-units-filter/OrgUnitChildSelectorButton";
import { useAppContext } from "../../contexts/app-context";

type FiltersProps = {
    api: D2Api;
    rootIds: string[];
    orgUnits: OrgUnit[];
    selectedOrgUnits: string[];
    selectedPeriod: string[];
    setSelectedOrgUnits: (paths: string[]) => void;
    setSelectedPeriods: (periods: string[]) => void;
};

const defaultLevels = [1, 2, 3];

export const Filters: React.FC<FiltersProps> = React.memo(props => {
    const {
        api,
        rootIds,
        selectedOrgUnits,
        selectedPeriod,
        setSelectedOrgUnits,
        setSelectedPeriods: onChangePeriod,
    } = props;
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [orgUnitsChildren, setOrgUnitsChildren] = React.useState<OrgUnit[]>([]);

    React.useEffect(() => {
        compositionRoot.orgUnits
            .getAllByLevel({ levels: defaultLevels })
            .then(result => {
                setOrgUnitsChildren(result);
            })
            .catch(() => {
                snackbar.error(i18n.t("Failed to load org units"));
            });
    }, [compositionRoot.orgUnits, snackbar]);

    // TODO: Fix type definition on OrgUnitChildSelectorButton to avoid type = any
    const updateOrgUnit = (getValues: any) => {
        const values = getValues();
        setSelectedOrgUnits(values.orgUnitPaths);
    };

    return (
        <ContainerFilter>
            <OrgUnitChildSelectorButton
                api={api}
                rootIds={rootIds}
                onChange={updateOrgUnit}
                orgUnitPaths={selectedOrgUnits}
                orgUnits={orgUnitsChildren}
                selectableLevels={defaultLevels}
            />

            <MultipleDropdown
                items={defaultPeriods}
                onChange={onChangePeriod}
                label={i18n.t("Period")}
                values={selectedPeriod}
            />
        </ContainerFilter>
    );
});

const ContainerFilter = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;
