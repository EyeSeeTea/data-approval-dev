import { Id, NamedRef } from "../../../common/entities/Base";

export interface MonitoringTwoFactorUser {
    id: Id;
    name: string;
    username: string;
    lastLogin: string;
    lastUpdated: string;
    externalAuth: string;
    email: string;
    disabled: string;
    twoFA: string;
    userGroups: NamedRef[];
    openId: string;
}
