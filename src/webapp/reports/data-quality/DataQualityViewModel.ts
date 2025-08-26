import { Config } from "../../../domain/common/entities/Config";
import { IndicatorItem, ProgramIndicatorItem } from "../../../domain/reports/data-quality/entities/DataQualityItem";

export interface IndicatorViewModel {
    id: string;
    lastUpdated: string;
    name: string;
    user: string;
    metadataType: string;
    denominator: string;
    denominatorResult: boolean;
    numerator: string;
    numeratorResult: boolean;
}

export interface ProgramIndicatorViewModel {
    id: string;
    lastUpdated: string;
    name: string;
    user: string;
    metadataType: string;
    expression: string;
    expressionResult: boolean;
    filter: string;
    filterResult: boolean | undefined;
}

export function getDataQualityIndicatorViews(_config: Config, items: IndicatorItem[]): IndicatorViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            denominator: item.denominator,
            denominatorResult: item.denominatorResult,
            lastUpdated: item.lastUpdated,
            name: item.name,
            numerator: item.numerator,
            numeratorResult: item.numeratorResult,
            user: item.user,
            metadataType: item.metadataType,
        };
    });
}

export function getDataQualityProgramIndicatorViews(
    _config: Config,
    items: ProgramIndicatorItem[]
): ProgramIndicatorViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            expression: item.expression,
            expressionResult: item.expressionResult,
            lastUpdated: item.lastUpdated,
            name: item.name,
            filter: item.filter,
            filterResult: item.filterResult,
            user: item.user,
            metadataType: item.metadataType,
        };
    });
}
