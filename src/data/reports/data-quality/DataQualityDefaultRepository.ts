import _ from "lodash";
import { paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import {
    DataQualityConfig,
    IndicatorItem,
    ProgramIndicatorItem,
    isIndicatorItem,
    isProgramIndicatorItem,
} from "../../../domain/reports/data-quality/entities/DataQualityItem";
import {
    DataQualityRepository,
    IndicatorOptions,
    ProgramIndicatorOptions,
} from "../../../domain/reports/data-quality/repositories/DataQualityRepository";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { promiseMap } from "../../../utils/promises";
import { Namespaces } from "../../common/clients/storage/Namespaces";

type IndicatorMetadataType = {
    id: string;
    name: string;
    lastUpdated: string;
    user: {
        displayName: string;
    };
    numerator: string;
    denominator: string;
};

type ProgramIndicatorMetadataType = {
    id: string;
    name: string;
    lastUpdated: string;
    user: {
        displayName: string;
    };
    expression?: string;
    filter?: string;
};

type DataQualityItemType = IndicatorItem | ProgramIndicatorItem;

export class DataQualityDefaultRepository implements DataQualityRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    private async getMetadata(api: D2Api, filter: Record<string, any>) {
        const { indicators } = await api.metadata
            .get({
                indicators: {
                    fields: {
                        id: true,
                        name: true,
                        numerator: true,
                        denominator: true,
                        lastUpdated: true,
                        user: { displayName: true },
                    },
                    filter: filter,
                },
            })
            .getData();

        const { programIndicators } = await api.metadata
            .get({
                programIndicators: {
                    fields: {
                        id: true,
                        name: true,
                        lastUpdated: true,
                        user: { displayName: true },
                        expression: true,
                        filter: true,
                    },
                    filter: filter,
                },
            })
            .getData();

        return { indicators, programIndicators };
    }

    async getIndicators(options: IndicatorOptions, namespace: string): Promise<PaginatedObjects<IndicatorItem>> {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);
        const { paging, sorting } = options;

        const dataQualityIndicatorErrors =
            (dataQuality?.validationResults?.filter(
                r => isIndicatorItem(r) && (!r.denominatorResult || !r.numeratorResult)
            ) as IndicatorItem[]) ?? [];

        return paginate(dataQualityIndicatorErrors, paging, sorting);
    }

    async getProgramIndicators(
        options: ProgramIndicatorOptions,
        namespace: string
    ): Promise<PaginatedObjects<ProgramIndicatorItem>> {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);
        const { paging, sorting } = options;

        const dataQualityProgramIndicatorErrors =
            (dataQuality?.validationResults?.filter(
                r => isProgramIndicatorItem(r) && (!r.expressionResult || !r.filterResult)
            ) as ProgramIndicatorItem[]) ?? [];

        return paginate(dataQualityProgramIndicatorErrors, paging, sorting);
    }

    private makeNewDataQualityConfig(validationResults: DataQualityItemType[]): DataQualityConfig {
        return {
            indicatorsLastUpdated: new Date().toISOString(),
            programIndicatorsLastUpdated: new Date().toISOString(),
            validationResults: validationResults,
        };
    }

    async saveDataQuality(namespace: string, dataQuality: DataQualityConfig): Promise<void> {
        return await this.globalStorageClient.saveObject<DataQualityConfig>(namespace, dataQuality);
    }

    private removeItemsByIds(ids: string[], ItamsArray: DataQualityItemType[]) {
        return ItamsArray.filter(itemToFilter => {
            return !ids.includes(itemToFilter.id);
        });
    }

    private statusToBoolean(status: "OK" | "ERROR") {
        return status === "OK" ? true : false;
    }

    private async getIndicatorValidations(
        api: D2Api,
        metadataItems: IndicatorMetadataType[]
    ): Promise<IndicatorItem[]> {
        return _(
            await promiseMap(metadataItems, async item => {
                try {
                    const numeratorValidation = await api.expressions.validate("indicator", item.numerator).getData();
                    const denominatorValidation = await api.expressions
                        .validate("indicator", item.denominator)
                        .getData();

                    const numeratorResult = this.statusToBoolean(numeratorValidation.status);
                    const denominatorResult = this.statusToBoolean(denominatorValidation.status);

                    return {
                        ...item,
                        user: item.user.displayName,
                        numeratorResult,
                        denominatorResult,
                        metadataType: "Indicator",
                    };
                } catch (error) {
                    console.debug(error);
                    return undefined;
                }
            })
        )
            .compact()
            .value() as IndicatorItem[];
    }

    private async getProgramIndicatorValidations(
        api: D2Api,
        metadataItems: ProgramIndicatorMetadataType[]
    ): Promise<ProgramIndicatorItem[]> {
        return _(
            await promiseMap(metadataItems, async item => {
                try {
                    const expressionValidation = item.expression
                        ? await api.expressions.validate("program-indicator-formula", item.expression).getData()
                        : undefined;

                    const filterValidation = item.filter
                        ? await api.expressions.validate("program-indicator-filter", item.filter).getData()
                        : undefined;

                    const expressionResult = expressionValidation
                        ? this.statusToBoolean(expressionValidation.status)
                        : false;

                    const filterResult = filterValidation ? this.statusToBoolean(filterValidation.status) : undefined;

                    return {
                        ...item,
                        user: item.user.displayName,
                        expressionResult,
                        filterResult,
                        metadataType: "ProgramIndicator",
                    };
                } catch (error) {
                    console.debug(error);

                    return undefined;
                }
            })
        )
            .compact()
            .value() as ProgramIndicatorItem[];
    }

    private async getValidations(
        api: D2Api,
        indicators: IndicatorMetadataType[],
        programIndicators: ProgramIndicatorMetadataType[]
    ): Promise<DataQualityItemType[]> {
        const indicatorValidations = await this.getIndicatorValidations(api, indicators);
        const programIndicatorValidations = await this.getProgramIndicatorValidations(api, programIndicators);

        return _.concat<DataQualityItemType>(indicatorValidations, programIndicatorValidations);
    }

    private getValidationErrors(
        indicatorValidations: DataQualityItemType[],
        oldIndicatorValidations?: DataQualityItemType[]
    ) {
        const newIndicators = indicatorValidations.flatMap(indicator => {
            if (indicator.metadataType === "Indicator") {
                if (!indicator.numeratorResult || !indicator.denominatorResult) {
                    return indicator;
                } else {
                    return [];
                }
            } else {
                if (!indicator.expressionResult || indicator.filterResult === false) {
                    return indicator;
                } else {
                    return [];
                }
            }
        });

        if (oldIndicatorValidations) {
            const newIds = indicatorValidations.map(indicator => indicator.id);
            const filteredOldIndicators = this.removeItemsByIds(newIds, oldIndicatorValidations) as IndicatorItem[];

            return _.concat(newIndicators, filteredOldIndicators);
        } else {
            return newIndicators;
        }
    }

    private async makeDataQualityObject(
        indicatorsMeta: IndicatorMetadataType[],
        programIndicatorsMeta: ProgramIndicatorMetadataType[],
        oldValidations?: DataQualityItemType[]
    ): Promise<void> {
        const validations = await this.getValidations(this.api, indicatorsMeta, programIndicatorsMeta);
        const validationErrors = this.getValidationErrors(validations, oldValidations);

        return await this.saveDataQuality(Namespaces.DATA_QUALITY, this.makeNewDataQualityConfig(validationErrors));
    }

    async loadValidation() {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(Namespaces.DATA_QUALITY);

        if (typeof dataQuality === "undefined" || dataQuality.validationResults.length === 0) {
            const { indicators, programIndicators } = await this.getMetadata(this.api, {});

            await this.makeDataQualityObject(indicators, programIndicators);
        } else {
            const { indicators, programIndicators } = await this.getMetadata(this.api, {
                lastUpdated: { gt: dataQuality.indicatorsLastUpdated },
            });

            await this.makeDataQualityObject(indicators, programIndicators, dataQuality.validationResults);
        }
    }

    async resetValidation() {
        const { indicators, programIndicators } = await this.getMetadata(this.api, {});

        await this.makeDataQualityObject(indicators, programIndicators);
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }
}
