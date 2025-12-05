export interface IndicatorItem {
    id: string;
    lastUpdated: string;
    metadataType: "Indicator";
    name: string;
    user: string;
    denominator: string;
    denominatorResult: boolean;
    numerator: string;
    numeratorResult: boolean;
}

export interface ProgramIndicatorItem {
    id: string;
    lastUpdated: string;
    metadataType: "ProgramIndicator";
    name: string;
    user: string;
    expression: string;
    expressionResult: boolean;
    filter: string;
    filterResult: boolean | undefined;
}

export function isIndicatorItem(item: any): item is IndicatorItem {
    return item.metadataType === "Indicator";
}

export function isProgramIndicatorItem(item: any): item is ProgramIndicatorItem {
    return item.metadataType === "ProgramIndicator";
}

export interface DataQualityConfig {
    indicatorsLastUpdated: string;
    programIndicatorsLastUpdated: string;
    validationResults: Array<IndicatorItem | ProgramIndicatorItem>;
}
