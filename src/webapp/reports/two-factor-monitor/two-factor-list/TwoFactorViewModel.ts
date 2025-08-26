import { MonitoringTwoFactorUser } from "../../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorUser";

export interface TwoFactorViewModel {
    id: string;
    name: string;
    username: string;
    lastLogin: string;
    lastUpdated: string;
    externalAuth: string;
    disabled: string;
    email: string;
    twoFA: string;
    openId: string;
    userGroups: string;
}

export function getTwoFactorMonitoringViews(items: MonitoringTwoFactorUser[]): TwoFactorViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            name: item.name,
            username: item.username,
            lastLogin: item.lastLogin !== undefined ? item.lastLogin : "-",
            lastUpdated: item.lastUpdated !== undefined ? item.lastUpdated : "-",
            externalAuth: item.externalAuth !== undefined ? String(item.externalAuth) : "-",
            disabled: item.disabled !== undefined ? String(item.disabled) : "-",
            email: item.email !== undefined ? item.email : "-",
            twoFA: item.twoFA !== undefined ? String(item.twoFA) : "-",
            openId: item.openId !== undefined ? item.openId : "-",
            userGroups: item.userGroups.map(ug => ug.name).join(", "),
        };
    });
}
