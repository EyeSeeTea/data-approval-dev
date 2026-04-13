import { Dhis2ConfigRepository } from "./data/common/Dhis2ConfigRepository";
import { Dhis2OrgUnitsRepository } from "./data/common/Dhis2OrgUnitsRepository";
import { GetConfig } from "./domain/common/usecases/GetConfig";
import { GetOrgUnitsUseCase } from "./domain/common/usecases/GetOrgUnitsUseCase";
import { UpdateMalApprovalStatusUseCase } from "./domain/reports/mal-data-approval/usecases/UpdateMalApprovalStatusUseCase";
import { GetMalDataSetsUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataSetsUseCase";
import { SaveMalDataApprovalColumnsUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDataApprovalColumnsUseCase";
import { SaveMalDataSetsUseCase } from "./domain/reports/mal-data-approval/usecases/SaveMalDataSetsUseCase";
import { D2Api } from "./types/d2-api";
import { GetMalDataDiffUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataDiffUseCase";
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
import { GetMalDashboardsSubscriptionUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMalDashboardsSubscriptionUseCase";
import { DataSetD2Repository } from "./data/common/DataSetD2Repository";
import { DataValuesD2Repository } from "./data/common/DataValuesD2Repository";
import { GetOrgUnitsByLevelUseCase } from "./domain/common/usecases/GetOrgUnitsByLevelUseCase";
import { GetMonitoringDetailsUseCase } from "./domain/reports/mal-data-subscription/usecases/GetMonitoringDetailsUseCase";
import { GetAllOrgUnitsByLevelUseCase } from "./domain/common/usecases/GetAllOrgUnitsByLevelUseCase";
import { GetMalDataApprovalOUsWithChildrenUseCase } from "./domain/reports/mal-data-approval/usecases/GetMalDataApprovalOUsWithChildrenUseCase";
import { OrgUnitWithChildrenD2Repository } from "./data/reports/mal-data-approval/OrgUnitWithChildrenD2Repository";
import { UpdateMonitoringUseCase } from "./domain/reports/mal-data-approval/usecases/UpdateMonitoringUseCase";
import { UserGroupD2Repository } from "./data/reports/mal-data-approval/UserGroupD2Repository";
import { MonitoringValueDataStoreRepository } from "./data/reports/mal-data-approval/MonitoringValueDataStoreRepository";
import { DataSetStatusD2Repository } from "./data/DataSetStatusD2Repository";
import { GetDataSetConfigurationsUseCase } from "./domain/usecases/GetDataSetConfigurationsUseCase";
import { UserD2Repository } from "./data/UserD2Repository";
import { DataSetConfigurationD2Repository } from "./data/DataSetConfigurationD2Repository";
import { GetUsersByUsernameUseCase } from "./domain/usecases/GetUsersByUsernameUseCase";
import { GetUserGroupsByCodeUseCase } from "./domain/usecases/GetUserGroupsByCodeUseCase";
import { SearchUsersAndUserGroupsUseCase } from "./domain/usecases/SearchUsersAndUserGroupsUseCase";
import { UserSharingD2Repository } from "./data/UserSharingD2Repository";
import { GetDataSetConfigurationByCodeUseCase } from "./domain/usecases/GetDataSetConfigurationByCodeUseCase";
import { MetadataEntityD2Repository } from "./data/MetadataEntityD2Repository";
import { GetMetadataEntitiesUseCase } from "./domain/usecases/GetMetadataEntitiesUseCase";
import { SaveDataSetConfigurationUseCase } from "./domain/usecases/SaveDataSetConfigurationUseCase";
import { GetApprovalConfigurationsUseCase } from "./domain/usecases/GetApprovalConfigurationsUseCase";
import { RemoveDataSetConfigurationUseCase } from "./domain/usecases/RemoveDataSetConfigurationUseCase";
import { DataElementGroupD2Repository } from "./data/reports/mal-data-approval/DataElementGroupD2Repository";
import { UserReadableDataElementsService } from "./domain/reports/mal-data-approval/services/UserReadableDataElementsService";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const dataDuplicationRepository = new MalDataApprovalDefaultRepository(api);
    const dataSubscriptionRepository = new MalDataSubscriptionDefaultRepository(api);
    const orgUnitsRepository = new Dhis2OrgUnitsRepository(api);
    const dataSetRepository = new DataSetD2Repository(api);
    const dataValuesRepository = new DataValuesD2Repository(api);
    const orgUnitsWithChildrenRepository = new OrgUnitWithChildrenD2Repository(api);
    const userGroupRepository = new UserGroupD2Repository(api);
    const monitoringValueRepository = new MonitoringValueDataStoreRepository(api);
    const dataSetStatusRepository = new DataSetStatusD2Repository(api);
    const userRepository = new UserD2Repository(api);
    const dataSetConfigurationRepository = new DataSetConfigurationD2Repository(api);
    const userSharingRepository = new UserSharingD2Repository(api);
    const metadataEntityRepository = new MetadataEntityD2Repository(api);
    const dataElementGroupRepository = new DataElementGroupD2Repository(api);
    const userReadableDataElementsService = new UserReadableDataElementsService(
        userRepository,
        dataElementGroupRepository
    );

    return {
        metadata: {
            getBy: new GetMetadataEntitiesUseCase({ metadataEntityRepository }),
        },
        sharing: {
            search: new SearchUsersAndUserGroupsUseCase({ userSharingRepository }),
        },
        userGroups: {
            getByCodes: new GetUserGroupsByCodeUseCase({ userGroupRepository }),
        },
        users: {
            getByUsernames: new GetUsersByUsernameUseCase({ userRepository }),
        },
        dataSetConfig: {
            getAll: new GetDataSetConfigurationsUseCase({
                dataSetConfigurationRepository,
                userRepository,
                dataSetRepository,
            }),
            getByCode: new GetDataSetConfigurationByCodeUseCase({ dataSetConfigurationRepository, userRepository }),
            save: new SaveDataSetConfigurationUseCase({ dataSetConfigurationRepository, userRepository }),
            remove: new RemoveDataSetConfigurationUseCase({ dataSetConfigurationRepository, userRepository }),
            getDataSets: new GetApprovalConfigurationsUseCase({
                dataSetConfigurationRepository,
                userRepository,
                dataSetRepository,
            }),
        },
        malDataApproval: getExecute({
            get: new GetMalDataSetsUseCase(
                dataDuplicationRepository,
                dataValuesRepository,
                dataSetRepository,
                userReadableDataElementsService
            ),
            getDiff: new GetMalDataDiffUseCase(
                dataValuesRepository,
                dataSetRepository,
                userReadableDataElementsService
            ),
            save: new SaveMalDataSetsUseCase(dataDuplicationRepository),
            getColumns: new GetMalDataApprovalColumnsUseCase(dataDuplicationRepository),
            saveColumns: new SaveMalDataApprovalColumnsUseCase(dataDuplicationRepository),
            getMonitoring: new GetMonitoringUseCase(monitoringValueRepository),
            updateMonitoring: new UpdateMonitoringUseCase(monitoringValueRepository, userGroupRepository),
            updateStatus: new UpdateMalApprovalStatusUseCase(
                dataDuplicationRepository,
                dataValuesRepository,
                dataSetRepository,
                userReadableDataElementsService
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
        orgUnits: getExecute({
            getAllByLevel: new GetAllOrgUnitsByLevelUseCase(orgUnitsRepository),
            get: new GetOrgUnitsUseCase(orgUnitsRepository),
            getByLevel: new GetOrgUnitsByLevelUseCase(orgUnitsRepository),
        }),
        config: getExecute({
            get: new GetConfig(configRepository),
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
