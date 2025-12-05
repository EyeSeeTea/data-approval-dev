import React from "react";
import { OrgUnitsFilterButton, OrgUnitsFilterButtonProps } from "./OrgUnitsFilterButton";
import _ from "lodash";
import { D2Api } from "../../../types/d2-api";
import { FilterOrgUnit } from "../../../domain/common/entities/OrgUnit";

interface OrgUnitsFilterProps {
    api: D2Api;
    onChange(value: React.SetStateAction<any>): void;
    orgUnitPaths: string[];
    orgUnits: FilterOrgUnit[];
    rootIds: string[];
    selectableLevels?: number[];
    selectableIds?: string[];
}

export const OrgUnitChildSelectorButton: React.FC<OrgUnitsFilterProps> = React.memo(props => {
    const { api, onChange, orgUnitPaths, orgUnits, rootIds, selectableIds, selectableLevels } = props;
    const orgUnitsByPath = React.useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const setOrgUnitPaths = React.useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        newSelectedPaths => {
            const prevSelectedPaths = orgUnitPaths;
            const addedPaths = _.difference(newSelectedPaths, prevSelectedPaths);
            const removedPaths = _.difference(prevSelectedPaths, newSelectedPaths);

            const pathsToAdd = _.flatMap(addedPaths, addedPath => {
                const orgUnit = orgUnitsByPath[addedPath];

                if (orgUnit && orgUnit.level < countryLevel) {
                    return [orgUnit, ...orgUnit.children].map(ou => ou.path);
                } else {
                    return [addedPath];
                }
            });

            const pathsToRemove = _.flatMap(removedPaths, pathToRemove => {
                return prevSelectedPaths.filter(path => path.startsWith(pathToRemove));
            });

            const newSelectedPathsWithChildren = _(prevSelectedPaths)
                .union(pathsToAdd)
                .difference(pathsToRemove)
                .uniq()
                .value();

            onChange((prev: any) => ({ ...prev, orgUnitPaths: newSelectedPathsWithChildren }));
        },
        [onChange, orgUnitPaths, orgUnitsByPath]
    );

    return (
        <OrgUnitsFilterButton
            api={api}
            rootIds={rootIds}
            selected={orgUnitPaths}
            setSelected={setOrgUnitPaths}
            selectableLevels={selectableLevels}
            selectableIds={selectableIds}
        />
    );
});

const countryLevel = 3;
