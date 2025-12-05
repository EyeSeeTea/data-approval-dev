export type OrgUnitWithChildren = {
    id: string;
    name: string;
    level: number;
    path: string;
    children?: OrgUnitWithChildren[];
};
