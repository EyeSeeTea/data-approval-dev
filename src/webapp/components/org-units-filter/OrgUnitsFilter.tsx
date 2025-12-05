import React from "react";
import _ from "lodash";
import { D2Api } from "../../../types/d2-api";
import { OrgUnitsSelector } from "@eyeseetea/d2-ui-components";
import { makeStyles } from "@material-ui/core";
import { Id } from "../../../domain/common/entities/Base";
import { getOrgUnitParentPath, OrgUnitPath } from "../../../domain/common/entities/OrgUnit";

export interface OrgUnitsFilterProps {
    api: D2Api;
    rootIds: Id[];
    selected: OrgUnitPath[];
    setSelected(newPaths: OrgUnitPath[]): void;
    selectableLevels?: number[];
    selectableIds?: Id[];
}

const orgUnitsSelectorControls = {};

export const OrgUnitsFilter: React.FC<OrgUnitsFilterProps> = React.memo(props => {
    const { api, rootIds, selected, setSelected, selectableIds, selectableLevels } = props;
    const classes = useStyles();
    const initiallyExpanded = React.useMemo(() => _.compact(selected.map(getOrgUnitParentPath)), [selected]);

    return (
        <div key={"org-unit-selector-filter"} className={classes.orgUnitFilter}>
            <OrgUnitsSelector
                api={api}
                withElevation={false}
                controls={orgUnitsSelectorControls}
                hideMemberCount={true}
                fullWidth={false}
                height={500}
                square={true}
                rootIds={rootIds}
                onChange={setSelected}
                selected={selected}
                selectOnClick={false}
                initiallyExpanded={initiallyExpanded}
                selectableIds={selectableIds}
                selectableLevels={selectableLevels}
            />
        </div>
    );
});

const useStyles = makeStyles({
    orgUnitFilter: {
        order: -1,
        marginRight: "1rem",
    },
});
