import { useCallback, useEffect, useMemo, useState } from "react";
import { DataSubmissionFilterProps, emptySubmissionFilter } from "./Filters";
import { DatePickerProps, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import { OrgUnitsFilterButtonProps } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { Module, Status } from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import _ from "lodash";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import { useAppContext } from "../../../contexts/app-context";
import { OrgUnitWithChildren } from "../../../../domain/reports/glass-data-submission/entities/OrgUnit";

export default function useDataSubmissionFilters(filterProps: DataSubmissionFilterProps) {
    const { compositionRoot, config } = useAppContext();
    const { values: filter, onChange } = filterProps;
    const { orgUnitPaths } = filter;

    useEffect(() => {
        compositionRoot.glassDataSubmission.getOrgUnitsWithChildren().then(setOrgUnits);
    }, [compositionRoot.glassDataSubmission]);

    const [filterValues, setFilterValues] = useState(emptySubmissionFilter);
    const [orgUnits, setOrgUnits] = useState<OrgUnitWithChildren[]>([]);
    const orgUnitsByPath = useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const rootIds = useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    const setModule = useCallback<SingleDropdownHandler>(module => {
        setFilterValues(filter => ({ ...filter, module: module as Module }));
    }, []);

    const setOrgUnitPaths = useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        newSelectedPaths => {
            const prevSelectedPaths = orgUnitPaths;
            const addedPaths = _.difference(newSelectedPaths, prevSelectedPaths);
            const removedPaths = _.difference(prevSelectedPaths, newSelectedPaths);

            const pathsToAdd = _.flatMap(addedPaths, addedPath => {
                const orgUnit = orgUnitsByPath[addedPath];
                if (orgUnit && orgUnit.level < countryLevel) {
                    return _.compact(
                        _.union(
                            [orgUnit],
                            orgUnit.children,
                            orgUnit.children?.flatMap(child => child.children)
                        )
                    ).map(ou => ou.path);
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

    const setPeriods = useCallback<DropdownHandler>(periods => setFilterValues(prev => ({ ...prev, periods })), []);

    const setStartDate = useCallback<DatePickerHandler>(from => setFilterValues(prev => ({ ...prev, from })), []);

    const setEndDate = useCallback<DatePickerHandler>(to => setFilterValues(prev => ({ ...prev, to })), []);

    const setQuarters = useCallback<DropdownHandler>(quarters => setFilterValues(prev => ({ ...prev, quarters })), []);

    const setCompletionStatus = useCallback<SingleDropdownHandler>(completionStatus => {
        setFilterValues(filter => ({ ...filter, completionStatus: toBool(completionStatus) }));
    }, []);

    const setSubmissionStatus = useCallback<SingleDropdownHandler>(submissionStatus => {
        setFilterValues(filter => ({ ...filter, submissionStatus: submissionStatus as Status }));
    }, []);

    const applyFilters = useCallback(() => {
        onChange(filterValues);
    }, [filterValues, onChange]);

    const clearFilters = useCallback(() => {
        onChange(emptySubmissionFilter);
        setFilterValues(emptySubmissionFilter);
    }, [onChange]);

    return {
        applyFilters,
        clearFilters,
        filterValues: filterValues,
        rootIds: rootIds,
        setFilterValues: {
            module: setModule,
            orgUnitPaths: setOrgUnitPaths,
            periods: setPeriods,
            startDate: setStartDate,
            endDate: setEndDate,
            quarters: setQuarters,
            completionStatus: setCompletionStatus,
            submissionStatus: setSubmissionStatus,
        },
    };
}

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
type DatePickerHandler = DatePickerProps["onChange"];

const countryLevel = 3;
