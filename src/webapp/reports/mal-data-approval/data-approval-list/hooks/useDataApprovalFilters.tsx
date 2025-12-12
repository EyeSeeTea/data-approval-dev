import { useCallback, useMemo, useState } from "react";
import { DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../../../contexts/app-context";
import { DataSetsFilter } from "../Filters";
import { OrgUnitsFilterButtonProps } from "../../../../components/org-units-filter/OrgUnitsFilterButton";
import { DataSetWithConfigPermissions } from "../../../../../domain/usecases/GetApprovalConfigurationsUseCase";

type DataApprovalFilterProps = {
    values: DataSetsFilter;
    onChange: (filter: DataSetsFilter) => void;
    dataSetsConfig: DataSetWithConfigPermissions[];
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
    const { config } = useAppContext();
    const allDataSets = filterProps.dataSetsConfig.map(ds => ds.dataSet);
    const initialDataSetIds = filterProps.dataSetsConfig.map(ds => ds.dataSet.id);
    const { onChange } = filterProps;

    const [filterValues, setFilterValues] = useState({ ...emptyApprovalFilter, dataSetIds: initialDataSetIds });

    const dataSetOrgUnits = allDataSets.flatMap(ds => ds.organisationUnits);

    const selectableIds = dataSetOrgUnits.map(ou => ou.id);
    const rootIds = useMemo(() => config.currentUser.orgUnits.map(ou => ou.id), [config.currentUser.orgUnits]);

    const setOrgUnitPaths = useCallback<OrgUnitsFilterButtonProps["setSelected"]>(newSelectedPaths => {
        setFilterValues(prev => ({ ...prev, orgUnitPaths: newSelectedPaths }));
    }, []);

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
