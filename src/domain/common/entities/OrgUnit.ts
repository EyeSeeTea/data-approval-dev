import _ from "lodash";
import { Id } from "./Base";

export type OrgUnitPath = string;

export interface OrgUnit {
    id: Id;
    path: OrgUnitPath;
    name: string;
    level: number;
    children: ChildrenOrgUnit[];
}

export interface FilterOrgUnit {
    id: Id;
    path: string;
    name: string;
    level: number;
    children: ChildrenOrgUnit[];
}

type ChildrenOrgUnit = { level: number; path: string };

const pathSeparator = "/";

export function getRoots(orgUnits: OrgUnit[]): OrgUnit[] {
    const minLevel = _.min(orgUnits.map(ou => ou.level));
    return _(orgUnits)
        .filter(ou => ou.level === minLevel)
        .sortBy(ou => ou.name)
        .value();
}

export function getRootIds(orgUnits: OrgUnit[]): Id[] {
    return getRoots(orgUnits).map(ou => ou.id);
}

export function getPath(orgUnits: OrgUnit[]): OrgUnitPath | undefined {
    return getRoots(orgUnits).map(ou => ou.path)[0];
}

export function getOrgUnitIdsFromPaths(orgUnitPathsSelected: OrgUnitPath[]): Id[] {
    return _(orgUnitPathsSelected)
        .map(path => _.last(path.split(pathSeparator)))
        .compact()
        .value();
}

export function getOrgUnitParentPath(path: OrgUnitPath) {
    return _(path).split(pathSeparator).initial().join(pathSeparator);
}

export function getOrgUnitsFromId(orgUnitIds: string[], orgUnits: OrgUnit[]): OrgUnit[] {
    return orgUnitIds.flatMap(orgUnitId => {
        return orgUnits.filter(ou => ou.id === orgUnitId);
    });
}
