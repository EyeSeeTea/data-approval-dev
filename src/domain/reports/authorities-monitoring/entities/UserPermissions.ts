import { NamedRef, Ref } from "../../../common/entities/Base";
import { UserMonitoring } from "../../../../data/reports/authorities-monitoring/AuthoritiesMonitoringDefaultRepository";

export type TemplateGroup = {
    group: NamedRef;
    template: NamedRef;
};

export type ExcludeRolesByGroup = {
    group: NamedRef;
    role: NamedRef;
};

export type ExcludeRolesByUser = {
    user: NamedRef;
    role: NamedRef;
};

export type ExcludeRolesByRole = {
    active_role: NamedRef;
    ignore_role: NamedRef;
};

export type UserRole = {
    id: string;
    name: string;
    authorities: string[];
};

export interface User extends NamedRef {
    userGroups: Ref[];
    userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };
}

export interface UserDetails extends NamedRef {
    authorities: string[];
    roles: UserRole[];
    userGroups: Ref[];
    userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };
}

export class UserPermissions {
    public readonly user: UserDetails;
    public readonly userMonitoring: UserMonitoring;

    constructor(user: UserDetails, userMonitoring: UserMonitoring) {
        this.user = user;
        this.userMonitoring = userMonitoring;
    }

    public isExcludedUser(): boolean {
        const { excludedUsers } = this.userMonitoring;

        return excludedUsers.some(excludedUser => this.user.id === excludedUser.id);
    }

    public hasAssignedTemplateGroup(): boolean {
        const { templates } = this.userMonitoring;
        const userTemplateIds = templates.map(template => template.template.id);

        return userTemplateIds.includes(this.user.id);
    }
}
