import _ from "lodash";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { emptyPage, paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { SummaryItem, SummaryType } from "../../../domain/reports/csy-summary-mortality/entities/SummaryItem";
import {
    SummaryOptions,
    SummaryItemRepository,
} from "../../../domain/reports/csy-summary-mortality/repositories/SummaryItemRepository";
import { D2Api } from "../../../types/d2-api";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";
import { AuditAnalyticsData, AuditAnalyticsResponse } from "../../../domain/common/entities/AuditAnalyticsResponse";

type RowValue = {
    scoringSystem: string;
    severity: string;
    mortalityCount: string;
    mortalityPercent: string;
    totalCount: string;
    totalPercent: string;
};

type Indicator = {
    id: string;
    shortName: string;
};

export class SummaryItemD2Repository implements SummaryItemRepository {
    constructor(private api: D2Api) {}

    async get(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        const { paging, year, orgUnitPaths, quarter, summaryType } = options;

        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);
        if (_.isEmpty(orgUnitIds)) return emptyPage;

        const objects = await this.getSummaryItems(summaryType, orgUnitIds, period);

        return paginate(objects, paging);
    }

    private async getSummaryItems(
        summaryType: SummaryType,
        orgUnitIds: string[],
        period: string
    ): Promise<SummaryItem[]> {
        const queryStrings = indicatorGroups[summaryType];

        const rows = _.flatten(
            await promiseMap(queryStrings, async indicatorGroup => {
                const analyticsResponse = await this.getAnalyticsResponse(period, indicatorGroup, orgUnitIds);
                const analyticsData = new AuditAnalyticsData(analyticsResponse);
                const cellValues = analyticsData.getColumnValues("value");

                return await this.getRowValues(indicatorGroup, cellValues);
            })
        );

        const objects: SummaryItem[] = _(rows)
            .groupBy(row => `${row.scoringSystem}-${row.severity}`)
            .map(groupedRows => {
                const groupedRow = groupedRows[0];

                const combinedMortalityCount = combineRowValues(groupedRows, "mortalityCount");
                const combinedMortalityPercent = combineRowValues(groupedRows, "mortalityPercent");
                const combinedTotalCount = combineRowValues(groupedRows, "totalCount");
                const combinedTotalPercent = combineRowValues(groupedRows, "totalPercent");

                return {
                    scoringSystem: groupedRow.scoringSystem,
                    severity: groupedRow.severity,
                    mortality: `${combinedMortalityCount} (${combinedMortalityPercent}%)`,
                    total: `${combinedTotalCount} (${combinedTotalPercent}%)`,
                };
            })
            .value();

        return this.sortSummaryItems(objects);
    }

    private sortSummaryItems(objects: SummaryItem[]): SummaryItem[] {
        const severityLevels = _.map(Object.keys(severity.GAP), _.capitalize);
        const getScoringSystemIndex = (row: SummaryItem): number => scoringSystem.indexOf(row.scoringSystem);
        const getSeverityIndex = (row: SummaryItem): number => {
            const severityLevel = row.severity.replace(/\(.+?\)/g, "").trim();
            return severityLevels.indexOf(severityLevel);
        };

        return _.orderBy(objects, [getScoringSystemIndex, getSeverityIndex]);
    }

    private async getAnalyticsResponse(
        period: string,
        indicatorGroup: string,
        orgUnitIds: string[]
    ): Promise<AuditAnalyticsResponse> {
        return await this.api.analytics
            .get({
                dimension: [`pe:${period}`, `dx:IN_GROUP-${indicatorGroup}`],
                filter: [`ou:${orgUnitIds.join(";")}`],
                skipMeta: true,
                includeNumDen: false,
            })
            .getData();
    }

    private async getIndicators(indicatorGroupId: string): Promise<Indicator[]> {
        const { indicatorGroups } = await this.api.metadata
            .get({
                indicatorGroups: {
                    fields: {
                        indicators: {
                            id: true,
                            shortName: true,
                        },
                    },
                    filter: {
                        id: {
                            eq: indicatorGroupId,
                        },
                    },
                },
            })
            .getData();

        return _.first(indicatorGroups)?.indicators ?? [];
    }

    private async getRowValues(indicatorGroup: string, cellValues: string[]): Promise<RowValue[]> {
        const indicators = await this.getIndicators(indicatorGroup);

        return indicators.map((indicator, index) => {
            const { shortName: indicatorName } = indicator;

            const scoringSystem = _.first(indicatorName.split(" ")) ?? "";
            const severityLevel = indicatorName.match(/\((.*?)\)/)?.[1] || "";
            const severityString: string = _.get(severity, [scoringSystem, severityLevel.toLowerCase()]);
            const isMortality = _.includes(indicatorName, "Mortality");
            const isCount = _.includes(indicatorName, "Count");

            const cellValue: string = cellValues[index] ?? "";

            return {
                scoringSystem: scoringSystem,
                severity: `${severityLevel} (${severityString})`,
                mortalityCount: isMortality && isCount ? cellValue : "",
                mortalityPercent: isMortality && !isCount ? cellValue : "",
                totalCount: !isMortality && isCount ? cellValue : "",
                totalPercent: !isMortality && !isCount ? cellValue : "",
            };
        });
    }

    async save(filename: string, rows: SummaryItemRow[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

function combineRowValues(groupedRows: RowValue[], rowValue: keyof RowValue): number {
    return _.sumBy(groupedRows, row => parseFloat(row[rowValue]) || 0);
}

const metadata = {
    indicatorGroups: {
        gapScoreCountId: "wwFwazs6FwA",
        gapScorePercentageId: "stkqbeOxGOd",
        ktsScoreCountId: "ZKBM3iVefSr",
        ktsScorePercentageId: "pCaxljXcHYr",
        mgapScoreCountId: "gYBciVYuJAV",
        mgapScorePercentageId: "IGxgJpoAwbE",
        rtsScoreCountId: "S9cU3cNqmCV",
        rtsScorePercentageId: "zQpmXtnkBOL",
    },
};

const indicatorGroups = {
    mortalityInjurySeverity: [
        metadata.indicatorGroups.gapScoreCountId,
        metadata.indicatorGroups.gapScorePercentageId,
        metadata.indicatorGroups.ktsScoreCountId,
        metadata.indicatorGroups.ktsScorePercentageId,
        metadata.indicatorGroups.mgapScoreCountId,
        metadata.indicatorGroups.mgapScorePercentageId,
        metadata.indicatorGroups.rtsScoreCountId,
        metadata.indicatorGroups.rtsScorePercentageId,
    ],
};

const scoringSystem = ["GAP", "MGAP", "KTS", "RTS"];

const severity = {
    GAP: {
        mild: "19 - 24",
        moderate: "11 - 18",
        severe: "3 - 10",
    },
    MGAP: {
        mild: "23 - 29",
        moderate: "18 - 22",
        severe: "3 - 17",
    },
    KTS: {
        mild: "14 - 16",
        moderate: "18 - 22",
        severe: "<11",
    },
    RTS: {
        mild: "11 - 12",
        moderate: "4 - 10",
        severe: "<=3",
    },
};

const csvFields = ["scoringSystem", "severity", "mortality", "total"] as const;

type CsvField = typeof csvFields[number];

type SummaryItemRow = Record<CsvField, string>;
