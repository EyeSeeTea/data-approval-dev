export const d2ReportsDataStoreNamespace = "d2-reports";
export const glassDataStoreNamespace = "glass";
export const d2ToolsNamespace = "d2-tools";
export const constantPrefix = "D2 Report Storage";

export type Namespace = typeof Namespaces[keyof typeof Namespaces];

export const Namespaces = {
    NHWA_APPROVAL_STATUS_USER_COLUMNS: "nhwa-approval-status-user-columns",
    MAL_APPROVAL_STATUS_USER_COLUMNS: "nhwa-data-approval-status-user-columns",
    MAL_DIFF_STATUS_USER_COLUMNS: "mal-diff-status-user-columns",
    MAL_DIFF_NAMES_SORT_ORDER: "nhwa-data-approval-diff-names-sort-order",
    MONITORING: "monitoring",
    MAL_SUBSCRIPTION_STATUS_USER_COLUMNS: "mal-subscription-status-user-columns",
    MAL_DASHBOARD_SUBSCRIPTION_USER_COLUMNS: "mal-dashboard-subscription-user-columns",
    MAL_SUBSCRIPTION_STATUS: "mal-subscription-status",
    DATA_SUBMISSSIONS: "data-submissions",
    FILE_UPLOADS: "uploads",
    FILE_UPLOADS_USER_COLUMNS: "uploads-user-columns",
    DATA_SUBMISSSIONS_USER_COLUMNS: "data-submissions-user-columns",
    ATCS: "ATCs",
    ATC_USER_COLUMNS: "atc-user-columns",
    AMC_RECALCULATION: "amc-recalculation",
    SIGNALS: "signals",
    SIGNALS_USER_COLUMNS: "signals-user-columns",
    DATA_SUBMISSSIONS_MODULES: "modules",
    DATA_SUBMISSSIONS_UPLOADS: "uploads",
    DATA_QUALITY: "data-quality",
    INDICATOR_STATUS_USER_COLUMNS: "indicator-status-user-columns",
    PROGRAM_INDICATOR_STATUS_USER_COLUMNS: "program-indicator-status-user-columns",
    AUTH_MONITORING: "permission-fixer",
    AUTH_MONITORING_USER_COLUMNS: "auth-monitoring-user-columns",
    USER_2FA: "user-monitoring",
    USER_2FA_USER_COLUMNS: "user-2fa-user-columns",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_DIFF_STATUS_USER_COLUMNS]: [],
    [Namespaces.MAL_DIFF_NAMES_SORT_ORDER]: [],
    [Namespaces.MONITORING]: [],
    [Namespaces.MAL_SUBSCRIPTION_STATUS]: [],
    [Namespaces.DATA_SUBMISSSIONS]: [],
    [Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS]: [],
    [Namespaces.ATCS]: [],
    [Namespaces.ATC_USER_COLUMNS]: [],
    [Namespaces.AMC_RECALCULATION]: [],
    [Namespaces.SIGNALS]: [],
    [Namespaces.SIGNALS_USER_COLUMNS]: [],
    [Namespaces.DATA_SUBMISSSIONS_MODULES]: [],
    [Namespaces.DATA_SUBMISSSIONS_UPLOADS]: [],
    [Namespaces.DATA_QUALITY]: [],
    [Namespaces.INDICATOR_STATUS_USER_COLUMNS]: [],
    [Namespaces.PROGRAM_INDICATOR_STATUS_USER_COLUMNS]: [],
    [Namespaces.AUTH_MONITORING]: [],
    [Namespaces.AUTH_MONITORING_USER_COLUMNS]: [],
    [Namespaces.USER_2FA]: [],
    [Namespaces.USER_2FA_USER_COLUMNS]: [],
};
