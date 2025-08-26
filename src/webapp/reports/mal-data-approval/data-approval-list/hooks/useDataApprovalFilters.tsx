import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../../../contexts/app-context";
import { DataSetsFilter } from "../Filters";
import { OrgUnitsFilterButtonProps } from "../../../../components/org-units-filter/OrgUnitsFilterButton";
import { getOrgUnitsFromId, getRootIds } from "../../../../../domain/common/entities/OrgUnit";
import { OrgUnitWithChildren } from "../../../../../domain/reports/mal-data-approval/entities/OrgUnitWithChildren";

type DataApprovalFilterProps = {
    values: DataSetsFilter;
    onChange: (filter: DataSetsFilter) => void;
};

type DataApprovalFilterState = {
    filterValues: DataSetsFilter;
    rootIds: string[];
    selectableIds: string[];
    applyFilters: () => void;
    clearFilters: () => void;
    setFilterValues: {
        dataSetId: DropdownHandler;
        orgUnitPaths: OrgUnitsFilterButtonProps["setSelected"];
        periods: DropdownHandler;
        completionStatus: SingleDropdownHandler;
        approvalStatus: SingleDropdownHandler;
        approvedStatus: SingleDropdownHandler;
        updateModificationCount: SingleDropdownHandler;
    };
};

export function useDataApprovalFilters(filterProps: DataApprovalFilterProps): DataApprovalFilterState {
    const { config, compositionRoot } = useAppContext();
    const initialDataSetIds = Object.keys(config.dataSets);
    const { values: filter, onChange } = filterProps;
    const { orgUnitPaths } = filter;

    const [filterValues, setFilterValues] = useState({ ...emptyApprovalFilter, dataSetIds: initialDataSetIds });
    const [orgUnits, setOrgUnits] = useState<OrgUnitWithChildren[]>([]);

    useEffect(() => {
        compositionRoot.malDataApproval.getOrgUnitsWithChildren().then(setOrgUnits);
    }, [compositionRoot.malDataApproval]);

    const dataSetOrgUnits = getOrgUnitsFromId(config.orgUnits, orgUnits);
    const selectableOUs = _.union(
        orgUnits.filter(org => org.level < countryLevel),
        dataSetOrgUnits
    );
    const selectableIds = selectableOUs.map(ou => ou.id);
    const rootIds = useMemo(() => getRootIds(selectableOUs), [selectableOUs]);
    const orgUnitsByPath = useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const setOrgUnitPaths = useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
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

            setFilterValues(prev => ({ ...prev, orgUnitPaths: newSelectedPathsWithChildren }));
        },
        [orgUnitPaths, orgUnitsByPath]
    );

    const setDataSetId = useCallback<DropdownHandler>(
        dataSetId => setFilterValues(prev => ({ ...prev, dataSetIds: dataSetId })),
        [setFilterValues]
    );

    const setPeriods = useCallback<DropdownHandler>(
        periods => setFilterValues(prev => ({ ...prev, periods: periods })),
        [setFilterValues]
    );

    const setCompletionStatus = useCallback<SingleDropdownHandler>(
        completionStatus => setFilterValues(prev => ({ ...prev, completionStatus: toBool(completionStatus) })),
        [setFilterValues]
    );

    const setApprovalStatus = useCallback<SingleDropdownHandler>(
        approvalStatus => setFilterValues(prev => ({ ...prev, approvalStatus: toBool(approvalStatus) })),
        [setFilterValues]
    );

    const setApprovedStatus = useCallback<SingleDropdownHandler>(
        approvedStatus => setFilterValues(prev => ({ ...prev, isApproved: toBool(approvedStatus) })),
        [setFilterValues]
    );

    const setModificationCount = useCallback<SingleDropdownHandler>(
        modificationCount => setFilterValues(prev => ({ ...prev, modificationCount: modificationCount })),
        [setFilterValues]
    );

    const applyFilters = useCallback(() => {
        onChange({ ...filterValues });
    }, [filterValues, onChange]);

    const clearFilters = useCallback(() => {
        onChange(emptyApprovalFilter);
        setFilterValues(emptyApprovalFilter);
    }, [onChange]);

    return {
        filterValues: filterValues,
        rootIds: rootIds,
        selectableIds: selectableIds,
        applyFilters: applyFilters,
        clearFilters: clearFilters,
        setFilterValues: {
            dataSetId: setDataSetId,
            orgUnitPaths: setOrgUnitPaths,
            periods: setPeriods,
            completionStatus: setCompletionStatus,
            approvalStatus: setApprovalStatus,
            approvedStatus: setApprovedStatus,
            updateModificationCount: setModificationCount,
        },
    };
}

const countryLevel = 3;

export const emptyApprovalFilter: DataSetsFilter = {
    dataSetIds: [],
    orgUnitPaths: [],
    periods: [],
    completionStatus: undefined,
    approvalStatus: undefined,
};

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
