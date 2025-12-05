import { Dhis2ConfigRepository } from "./data/common/Dhis2ConfigRepository";
import { Dhis2OrgUnitsRepository } from "./data/common/Dhis2OrgUnitsRepository";
import { NHWADataApprovalDefaultRepository } from "./data/reports/nhwa-approval-status/NHWADataApprovalDefaultRepository";
import { NHWADataCommentsDefaultRepository } from "./data/reports/nhwa-comments/NHWADataCommentsDefaultRepository";
import { WIDPAdminDefaultRepository } from "./data/reports/admin/WIDPAdminDefaultRepository";
import { GetWIDPAdminDefaultUseCase } from "./domain/reports/admin/usecases/GetWIDPAdminDefaultUseCase";
import { SaveWIDPAdminDefaultCsvUseCase } from "./domain/reports/admin/usecases/SaveWIDPAdminDefaultCsvUseCase";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetOrgUnitsUseCase } from "./domain/common/usecases/GetOrgUnitsUseCase";
import { UpdateStatusUseCase } from "./domain/reports/nhwa-approval-status/usecases/UpdateStatusUseCase";
import { GetApprovalColumnsUseCase } from "./domain/reports/nhwa-approval-status/usecases/GetApprovalColumnsUseCase";
import { GetDataSetsUseCase } from "./domain/reports/nhwa-approval-status/usecases/GetDataSetsUseCase";
import { SaveApprovalColumnsUseCase } from "./domain/reports/nhwa-approval-status/usecases/SaveApprovalColumnsUseCase";
import { SaveDataSetsUseCase } from "./domain/reports/nhwa-approval-status/usecases/SaveDataSetsCsvUseCase";
import { GetDataValuesUseCase } from "./domain/reports/nhwa-comments/usecases/GetDataValuesUseCase";
import { SaveDataValuesUseCase } from "./domain/reports/nhwa-comments/usecases/SaveDataValuesCsvUseCase";
import { UpdateMalApprovalStatusUseCase } from "./domain/reports/mal-data-approval/usecases/UpdateMalApprovalStatusUseCase";
import { GetMalDataSetsUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataSetsUseCase";
import { SaveMalDataApprovalColumnsUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDataApprovalColumnsUseCase";
import { SaveMalDataSetsUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDataSetsUseCase";
import { D2Api } from "./types/d2-api";
import { GetMalDataDiffUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataDiffUseCase";
import { getReportType } from "./webapp/utils/reportType";
import { GetMalDataApprovalColumnsUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataApprovalColumnsUseCase";
import { MalDataApprovalDefaultRepository } from "./data/reports/mal-data-approval/MalDataApprovalDefaultRepository";
import { MalDataSubscriptionDefaultRepository } from "./data/reports/mal-data-subscription/MalDataSubscriptionDefaultRepository";
import { GetSortOrderUseCase } from "./domain/reports/mal-data-approval/usecases/GetSortOrderUseCase";
import { SaveMalDiffNamesUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDiffNamesUseCase";
import { GetMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/GetMonitoringUseCase";
import { DuplicateDataValuesUseCase } from "./domain/reports/mal-data-approval/usecases/DuplicateDataValuesUseCase";
import { GetMalDataElementsSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDataElementsSubscriptionUseCase";
import { SaveMalDataSubscriptionColumnsUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveMalDataSubscriptionColumnsUseCase";
import { GetMalDataSubscriptionColumnsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDataSubscriptionColumnsUseCase";
import { SaveSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveSubscriptionUseCase";
import { GetSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetSubscriptionUseCase";
import { GetMonitoringUseCase as GetSubscriptionMonitoringUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMonitoringUseCase";
import { SaveMonitoringUseCase as SaveSubscriptionMonitoringUseCase } from "./domain/reports/mal-data-subscription/usecases/SaveMonitoringUseCase";
import { AuditItemD2Repository as CSYAuditEmergencyD2Repository } from "./data/reports/csy-audit-emergency/AuditItemD2Repository";
import { GetAuditEmergencyUseCase } from "./domain/reports/csy-audit-emergency/usecases/GetAuditEmergencyUseCase";
import { SaveAuditEmergencyUseCase } from "./domain/reports/csy-audit-emergency/usecases/SaveAuditEmergencyUseCase";
import { GetAuditTraumaUseCase } from "./domain/reports/csy-audit-trauma/usecases/GetAuditTraumaUseCase";
import { SaveAuditTraumaUseCase } from "./domain/reports/csy-audit-trauma/usecases/SaveAuditTraumaUseCase";
import { GLASSDataSubmissionDefaultRepository } from "./data/reports/glass-data-submission/GLASSDataSubmissionDefaultRepository";
import { GetGLASSDataSubmissionUseCase } from "./domain/reports/glass-data-submission/usecases/GetGLASSDataSubmissionUseCase";
import { GetGLASSDataSubmissionColumnsUseCase } from "./domain/reports/glass-data-submission/usecases/GetGLASSDataSubmissionColumnsUseCase";
import { SaveGLASSDataSubmissionColumnsUseCase } from "./domain/reports/glass-data-submission/usecases/SaveGLASSDataSubmissionColumnsUseCase";
import { UpdateGLASSSubmissionUseCase } from "./domain/reports/glass-data-submission/usecases/UpdateGLASSSubmissionUseCase";
import { DHIS2MessageCountUseCase } from "./domain/reports/glass-data-submission/usecases/DHIS2MessageCountUseCase";
import { SummaryItemD2Repository as CSYSummaryPatientD2Repository } from "./data/reports/csy-summary-patient/SummaryItemD2Repository";
import { GetSummaryUseCase } from "./domain/reports/csy-summary-patient/usecases/GetSummaryUseCase";
import { SaveSummaryUseCase } from "./domain/reports/csy-summary-patient/usecases/SaveSummaryUseCase";
import { SummaryItemD2Repository as CSYSummaryMortalityD2Repository } from "./data/reports/csy-summary-mortality/SummaryItemD2Repository";
import { GetSummaryMortalityUseCase } from "./domain/reports/csy-summary-mortality/usecases/GetSummaryUseCase";
import { SaveSummaryMortalityUseCase } from "./domain/reports/csy-summary-mortality/usecases/SaveSummaryUseCase";
import { AuditItemD2Repository as CSYAuditTraumaD2Repository } from "./data/reports/csy-audit-trauma/AuditItemD2Repository";
import { GetMalDashboardsSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDashboardsSubscriptionUseCase";
import { GetAutoCompleteComputeValuesUseCase } from "./domain/reports/nhwa-auto-complete-compute/usecases/GetAutoCompleteComputeValuesUseCase";
import { DataSetD2Repository } from "./data/common/DataSetD2Repository";
import { DataValuesD2Repository } from "./data/common/DataValuesD2Repository";
import { FixAutoCompleteComputeValuesUseCase } from "./domain/reports/nhwa-auto-complete-compute/usecases/FixAutoCompleteComputeValuesUseCase";
import { GetOrgUnitsByLevelUseCase } from "./domain/common/usecases/GetOrgUnitsByLevelUseCase";
import { AutoCompleteComputeSettingsD2Repository } from "./data/reports/nhwa-auto-complete-compute/AutoCompleteComputeSettingsD2Repository";
import { GetTotalsByActivityLevelUseCase } from "./domain/reports/nhwa-fix-totals/GetTotalsByActivityLevelUseCase";
import { FixTotalsValuesUseCase } from "./domain/reports/nhwa-fix-totals/usecases/FixTotalsValuesUseCase";
import { FixTotalsSettingsD2Repository } from "./data/reports/nhwa-fix-totals/FixTotalsSettingsD2Repository";
import { SubnationalCorrectD2Repository } from "./data/reports/nhwa-subnational-correct-orgunit/SubnationalCorrectD2Repository";
import { GetSubnationalCorrectUseCase } from "./domain/reports/nhwa-subnational-correct-orgunit/usecases/GetSubnationalCorrectUseCase";
import { DismissSubnationalCorrectValuesUseCase } from "./domain/reports/nhwa-subnational-correct-orgunit/usecases/DismissSubnationalCorrectValuesUseCase";
import { SubnationalCorrectD2SettingsRepository } from "./data/reports/nhwa-subnational-correct-orgunit/SubnationalCorrectD2SettingsRepository";
import { GetEARDataSubmissionUseCase } from "./domain/reports/glass-data-submission/usecases/GetEARDataSubmissionUseCase";
import { DataQualityDefaultRepository } from "./data/reports/data-quality/DataQualityDefaultRepository";
import { GetIndicatorsUseCase } from "./domain/reports/data-quality/usecases/GetIndicatorsUseCase";
import { GetProgramIndicatorsUseCase } from "./domain/reports/data-quality/usecases/GetProgramIndicatorsUseCase";
import { SaveDataQualityColumnsUseCase } from "./domain/reports/data-quality/usecases/SaveDataQualityColumnsUseCase";
import { GetDataQualityColumnsUseCase } from "./domain/reports/data-quality/usecases/GetDataQualityColumnsUseCase";
import { SaveDataQualityUseCase } from "./domain/reports/data-quality/usecases/SaveDataQualityUseCase";
import { LoadDataQualityValidation } from "./domain/reports/data-quality/usecases/loadDataQualityValidation";
import { ResetDataQualityValidation } from "./domain/reports/data-quality/usecases/ResetDataQualityValidation";
import { GetMonitoringDetailsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMonitoringDetailsUseCase";
import { AuthoritiesMonitoringDefaultRepository } from "./data/reports/authorities-monitoring/AuthoritiesMonitoringDefaultRepository";
import { GetAuthoritiesMonitoringUseCase } from "./domain/reports/authorities-monitoring/usecases/GetAuthoritiesMonitoringUseCase";
import { GetAuthoritiesMonitoringColumnsUseCase } from "./domain/reports/authorities-monitoring/usecases/GetAuthoritiesMonitoringColumnsUseCase";
import { SaveAuthoritiesMonitoringColumnsUseCase } from "./domain/reports/authorities-monitoring/usecases/SaveAuthoritiesMonitoringColumnsUseCase";
import { GetGLASSDataMaintenanceUseCase } from "./domain/reports/glass-admin/usecases/GetGLASSDataMaintenanceUseCase";
import { GLASSDataMaintenanceDefaultRepository } from "./data/reports/glass-admin/GLASSDataMaintenanceDefaultRepository";
import { GetGLASSDataMaintenanceColumnsUseCase } from "./domain/reports/glass-admin/usecases/GetGLASSDataMaintenanceColumnsUseCase";
import { SaveGLASSDataMaintenanceColumnsUseCase } from "./domain/reports/glass-admin/usecases/SaveGLASSDataMaintenanceColumnsUseCase";
import { GetGLASSModulesUseCase } from "./domain/reports/glass-admin/usecases/GetGLASSModulesUseCase";
import { UpdateGLASSDataMaintenanceUseCase } from "./domain/reports/glass-admin/usecases/UpdateGLASSDataMaintenanceUseCase";
import { GetATCsUseCase } from "./domain/reports/glass-admin/usecases/GetATCsUseCase";
import { UploadATCFileUseCase } from "./domain/reports/glass-admin/usecases/UploadATCFileUseCase";
import { SaveAMCRecalculationLogic } from "./domain/reports/glass-admin/usecases/SaveAMCRecalculationLogic";
import { GetATCLoggerProgramUseCase } from "./domain/reports/glass-admin/usecases/GetATCLoggerProgramUseCase";
import { GetATCRecalculationLogicUseCase } from "./domain/reports/glass-admin/usecases/GetATCRecalculationLogicUseCase";
import { CancelRecalculationUseCase } from "./domain/reports/glass-admin/usecases/CancelRecalculationUseCase";
import { GetGLASSDataSubmissionModulesUseCase } from "./domain/reports/glass-data-submission/usecases/GetGLASSDataSubmissionModulesUseCase";
import { SaveAuthoritiesMonitoringUseCase } from "./domain/reports/authorities-monitoring/usecases/SaveAuthoritiesMonitoringUseCase";
import { GetAutoCompleteComputeSettingsUseCase } from "./domain/reports/nhwa-auto-complete-compute/usecases/GetAutoCompleteComputeSettingsUseCase";
import { GetMonitoringTwoFactorUseCase } from "./domain/reports/twofactor-monitoring/usecases/GetMonitoringTwoFactorUseCase";
import { SaveMonitoringTwoFactorColumnsUseCase } from "./domain/reports/twofactor-monitoring/usecases/SaveMonitoringTwoFactorColumnsUseCase";
import { GetMonitoringTwoFactorColumnsUseCase } from "./domain/reports/twofactor-monitoring/usecases/GetMonitoringTwoFactorColumnsUseCase";
import { SaveMonitoringTwoFactorUseCase } from "./domain/reports/twofactor-monitoring/usecases/SaveMonitoringTwoFactorUseCase";
import { MonitoringTwoFactorD2Repository } from "./data/reports/twofactor-monitoring/MonitoringTwoFactorD2Repository";
import { GetOrgUnitsWithChildrenUseCase } from "./domain/reports/glass-data-submission/usecases/GetOrgUnitsWithChildrenUseCase";
import { GetAllOrgUnitsByLevelUseCase } from "./domain/common/usecases/GetAllOrgUnitsByLevelUseCase";
import { GetMalDataApprovalOUsWithChildrenUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataApprovalOUsWithChildrenUseCase";
import { OrgUnitWithChildrenD2Repository } from "./data/reports/mal-data-approval/OrgUnitWithChildrenD2Repository";
import { UpdateMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/UpdateMonitoringUseCase";
import { UserGroupD2Repository } from "./data/reports/mal-data-approval/UserGroupD2Repository";
import { MonitoringValueDataStoreRepository } from "./data/reports/mal-data-approval/MonitoringValueDataStoreRepository";
import { AppSettingsD2Repository } from "./data/AppSettingsD2Repository";
import { GetAppSettingsUseCase } from "./domain/usecases/GetAppSettingsUseCase";
import { DataSetStatusD2Repository } from "./data/DataSetStatusD2Repository";
import { GetDataSetStatusUseCase } from "./domain/usecases/GetDataSetStatusUseCase";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api, getReportType());
    const csyAuditEmergencyRepository = new CSYAuditEmergencyD2Repository(api);
    const csyAuditTraumaRepository = new CSYAuditTraumaD2Repository(api);
    const dataCommentsRepository = new NHWADataCommentsDefaultRepository(api);
    const dataApprovalRepository = new NHWADataApprovalDefaultRepository(api);
    const dataDuplicationRepository = new MalDataApprovalDefaultRepository(api);
    const dataSubscriptionRepository = new MalDataSubscriptionDefaultRepository(api);
    const dataQualityRepository = new DataQualityDefaultRepository(api);
    const widpAdminDefaultRepository = new WIDPAdminDefaultRepository(api);
    const glassAdminRepository = new GLASSDataMaintenanceDefaultRepository(api);
    const glassDataRepository = new GLASSDataSubmissionDefaultRepository(api);
    const csySummaryPatientRepository = new CSYSummaryPatientD2Repository(api);
    const csySummaryMortalityRepository = new CSYSummaryMortalityD2Repository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);
    const dataSetRepository = new DataSetD2Repository(api);
    const dataValuesRepository = new DataValuesD2Repository(api);
    const autoCompleteComputeSettingsRepository = new AutoCompleteComputeSettingsD2Repository(api);
    const fixTotalSettingsRepository = new FixTotalsSettingsD2Repository(api);
    const subnationalCorrectRepository = new SubnationalCorrectD2Repository(api);
    const subnationalCorrectSettingsRepository = new SubnationalCorrectD2SettingsRepository(api);
    const authoritiesMonitoringRepository = new AuthoritiesMonitoringDefaultRepository(api);
    const monitoringTwoFactorD2Repository = new MonitoringTwoFactorD2Repository(api);
    const orgUnitsWithChildrenRepository = new OrgUnitWithChildrenD2Repository(api);
    const userGroupRepository = new UserGroupD2Repository(api);
    const monitoringValueRepository = new MonitoringValueDataStoreRepository(api);
    const appSettingsRepository = new AppSettingsD2Repository();
    const dataSetStatusRepository = new DataSetStatusD2Repository(api);

    return {
        dataSetStatus: {
            get: new GetDataSetStatusUseCase(dataSetStatusRepository),
        },
        appSettings: {
            get: new GetAppSettingsUseCase(appSettingsRepository),
        },
        admin: getExecute({
            get: new GetWIDPAdminDefaultUseCase(widpAdminDefaultRepository),
            save: new SaveWIDPAdminDefaultCsvUseCase(widpAdminDefaultRepository),
        }),
        dataComments: getExecute({
            get: new GetDataValuesUseCase(dataCommentsRepository),
            save: new SaveDataValuesUseCase(dataCommentsRepository),
        }),
        dataApproval: getExecute({
            get: new GetDataSetsUseCase(dataApprovalRepository),
            save: new SaveDataSetsUseCase(dataApprovalRepository),
            getColumns: new GetApprovalColumnsUseCase(dataApprovalRepository),
            saveColumns: new SaveApprovalColumnsUseCase(dataApprovalRepository),
            updateStatus: new UpdateStatusUseCase(dataApprovalRepository),
        }),
        malDataApproval: getExecute({
            get: new GetMalDataSetsUseCase(
                dataDuplicationRepository,
                dataValuesRepository,
                dataSetRepository,
                monitoringValueRepository,
                appSettingsRepository
            ),
            getDiff: new GetMalDataDiffUseCase(dataValuesRepository, dataSetRepository, appSettingsRepository),
            save: new SaveMalDataSetsUseCase(dataDuplicationRepository),
            getColumns: new GetMalDataApprovalColumnsUseCase(dataDuplicationRepository),
            saveColumns: new SaveMalDataApprovalColumnsUseCase(dataDuplicationRepository),
            getMonitoring: new GetMonitoringUseCase(monitoringValueRepository),
            updateMonitoring: new UpdateMonitoringUseCase(monitoringValueRepository, userGroupRepository),
            updateStatus: new UpdateMalApprovalStatusUseCase(
                dataDuplicationRepository,
                dataValuesRepository,
                dataSetRepository,
                appSettingsRepository
            ),
            duplicateValue: new DuplicateDataValuesUseCase(dataDuplicationRepository, dataSetStatusRepository),
            getSortOrder: new GetSortOrderUseCase(dataDuplicationRepository),
            saveMalDiffNames: new SaveMalDiffNamesUseCase(dataDuplicationRepository),
            getOrgUnitsWithChildren: new GetMalDataApprovalOUsWithChildrenUseCase(orgUnitsWithChildrenRepository),
        }),
        malDataSubscription: getExecute({
            get: new GetMalDataElementsSubscriptionUseCase(dataSubscriptionRepository),
            getDashboardDataElements: new GetMalDashboardsSubscriptionUseCase(dataSubscriptionRepository),
            getMonitoringDetails: new GetMonitoringDetailsUseCase(dataSubscriptionRepository),
            getColumns: new GetMalDataSubscriptionColumnsUseCase(dataSubscriptionRepository),
            saveColumns: new SaveMalDataSubscriptionColumnsUseCase(dataSubscriptionRepository),
            getSubscription: new GetSubscriptionUseCase(dataSubscriptionRepository),
            saveSubscription: new SaveSubscriptionUseCase(dataSubscriptionRepository),
            getMonitoring: new GetSubscriptionMonitoringUseCase(dataSubscriptionRepository),
            saveMonitoring: new SaveSubscriptionMonitoringUseCase(dataSubscriptionRepository),
        }),
        auditEmergency: getExecute({
            get: new GetAuditEmergencyUseCase(csyAuditEmergencyRepository),
            save: new SaveAuditEmergencyUseCase(csyAuditEmergencyRepository),
        }),
        auditTrauma: getExecute({
            get: new GetAuditTraumaUseCase(csyAuditTraumaRepository),
            save: new SaveAuditTraumaUseCase(csyAuditTraumaRepository),
        }),
        glassAdmin: getExecute({
            get: new GetGLASSDataMaintenanceUseCase(glassAdminRepository),
            getATCs: new GetATCsUseCase(glassAdminRepository),
            getModules: new GetGLASSModulesUseCase(glassAdminRepository),
            getATCRecalculationLogic: new GetATCRecalculationLogicUseCase(glassAdminRepository),
            cancelRecalculation: new CancelRecalculationUseCase(glassAdminRepository),
            getATCLoggerProgram: new GetATCLoggerProgramUseCase(glassAdminRepository),
            updateStatus: new UpdateGLASSDataMaintenanceUseCase(glassAdminRepository),
            saveRecalculationLogic: new SaveAMCRecalculationLogic(glassAdminRepository),
            uploadFile: new UploadATCFileUseCase(glassAdminRepository),
            getColumns: new GetGLASSDataMaintenanceColumnsUseCase(glassAdminRepository),
            saveColumns: new SaveGLASSDataMaintenanceColumnsUseCase(glassAdminRepository),
        }),
        glassDataSubmission: getExecute({
            get: new GetGLASSDataSubmissionUseCase(glassDataRepository),
            getModules: new GetGLASSDataSubmissionModulesUseCase(glassDataRepository),
            getEAR: new GetEARDataSubmissionUseCase(glassDataRepository),
            getColumns: new GetGLASSDataSubmissionColumnsUseCase(glassDataRepository),
            saveColumns: new SaveGLASSDataSubmissionColumnsUseCase(glassDataRepository),
            dhis2MessageCount: new DHIS2MessageCountUseCase(glassDataRepository),
            updateStatus: new UpdateGLASSSubmissionUseCase(glassDataRepository),
            getOrgUnitsWithChildren: new GetOrgUnitsWithChildrenUseCase(glassDataRepository),
        }),
        summary: getExecute({
            get: new GetSummaryUseCase(csySummaryPatientRepository),
            save: new SaveSummaryUseCase(csySummaryPatientRepository),
        }),
        summaryMortality: getExecute({
            get: new GetSummaryMortalityUseCase(csySummaryMortalityRepository),
            save: new SaveSummaryMortalityUseCase(csySummaryMortalityRepository),
        }),
        dataQuality: getExecute({
            getIndicators: new GetIndicatorsUseCase(dataQualityRepository),
            getProgramIndicators: new GetProgramIndicatorsUseCase(dataQualityRepository),
            saveDataQuality: new SaveDataQualityUseCase(dataQualityRepository),
            loadValidation: new LoadDataQualityValidation(dataQualityRepository),
            resetValidation: new ResetDataQualityValidation(dataQualityRepository),
            getColumns: new GetDataQualityColumnsUseCase(dataQualityRepository),
            saveColumns: new SaveDataQualityColumnsUseCase(dataQualityRepository),
        }),
        orgUnits: getExecute({
            getAllByLevel: new GetAllOrgUnitsByLevelUseCase(orgUnitsRepository),
            get: new GetOrgUnitsUseCase(orgUnitsRepository),
            getByLevel: new GetOrgUnitsByLevelUseCase(orgUnitsRepository),
        }),
        config: getExecute({
            get: new GetConfig(configRepository),
        }),
        nhwa: {
            getAutoCompleteComputeSettings: new GetAutoCompleteComputeSettingsUseCase(
                autoCompleteComputeSettingsRepository
            ),
            getAutoCompleteComputeValues: new GetAutoCompleteComputeValuesUseCase(
                dataSetRepository,
                dataValuesRepository
            ),
            fixAutoCompleteComputeValues: new FixAutoCompleteComputeValuesUseCase(dataValuesRepository),
            getTotalsByActivityLevel: new GetTotalsByActivityLevelUseCase(
                dataSetRepository,
                dataValuesRepository,
                fixTotalSettingsRepository
            ),
            fixTotalValues: new FixTotalsValuesUseCase(dataValuesRepository),
            getSubnationalCorrectValues: new GetSubnationalCorrectUseCase(subnationalCorrectRepository),
            dismissSubnationalCorrectValues: new DismissSubnationalCorrectValuesUseCase(
                dataValuesRepository,
                subnationalCorrectSettingsRepository
            ),
        },
        authMonitoring: getExecute({
            get: new GetAuthoritiesMonitoringUseCase(authoritiesMonitoringRepository),
            save: new SaveAuthoritiesMonitoringUseCase(authoritiesMonitoringRepository),
            getColumns: new GetAuthoritiesMonitoringColumnsUseCase(authoritiesMonitoringRepository),
            saveColumns: new SaveAuthoritiesMonitoringColumnsUseCase(authoritiesMonitoringRepository),
        }),
        twoFactorUserMonitoring: getExecute({
            get: new GetMonitoringTwoFactorUseCase(monitoringTwoFactorD2Repository),
            save: new SaveMonitoringTwoFactorUseCase(monitoringTwoFactorD2Repository),
            getColumns: new GetMonitoringTwoFactorColumnsUseCase(monitoringTwoFactorD2Repository),
            saveColumns: new SaveMonitoringTwoFactorColumnsUseCase(monitoringTwoFactorD2Repository),
        }),
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}

export interface UseCase {
    execute: Function;
}
