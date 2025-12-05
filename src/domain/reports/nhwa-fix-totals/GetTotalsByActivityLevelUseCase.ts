import _ from "lodash";

import { DataSetRepository } from "../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../common/repositories/DataValuesRepository";
import {
    FixTotalsViewModel,
    FixTotalsWithPaging,
} from "../../../webapp/reports/nhwa-fix-totals-activity-level/NHWAFixTotals";
import { Id } from "../../common/entities/Base";
import { defaultPeriods } from "../../../webapp/reports/common/nhwa-settings";
import { promiseMap } from "../../../utils/promises";
import { DataValue } from "../../common/entities/DataValue";
import { FixTotalsSettingsRepository } from "./repositories/FixTotalsSettingsRepository";

export type FixTotalsFilter = {
    page: number;
    pageSize: number;
    sortingField: string;
    sortingOrder: "asc" | "desc";
    filters: { periods: string[]; orgUnits: string[] };
};

export class GetTotalsByActivityLevelUseCase {
    constructor(
        private dataSetRepository: DataSetRepository,
        private dataValuesRepository: DataValuesRepository,
        private settingsRepository: FixTotalsSettingsRepository
    ) {}

    async execute(options: FixTotalsFilter): Promise<FixTotalsWithPaging> {
        const autoCompleteValues = await this.getAllAutoCompleteValues(options);
        const sortValues = _(autoCompleteValues)
            .orderBy(this.getSortField(options.sortingField), options.sortingOrder)
            .value();
        const { rows, page, pageSize } = this.getPaginatedItems(sortValues, options.page, options.pageSize);
        return {
            page,
            pageSize,
            pageCount: Math.ceil(autoCompleteValues.length / pageSize),
            total: autoCompleteValues.length,
            rows: _(rows).orderBy(this.getSortField(options.sortingField), options.sortingOrder).value(),
        };
    }

    private async getAllAutoCompleteValues(options: FixTotalsFilter): Promise<FixTotalsViewModel[]> {
        const { filters } = options;

        const fixTotalSettings = await this.settingsRepository.get();
        const dataSets = await this.dataSetRepository.getById(fixTotalSettings.dataSet);
        const dataSet = dataSets[0];
        if (!dataSet) return [];

        const orgUnitsByKey = _(dataSet.organisationUnits)
            .keyBy(ou => ou.id)
            .value();

        const dataElementsByKey = _(dataSet.dataElements)
            .keyBy(de => de.id)
            .value();

        const orgUnitsToRequest = filters.orgUnits.length
            ? filters.orgUnits
            : dataSet.organisationUnits.map(ou => ou.id);

        const dataValues = await promiseMap(_.chunk(orgUnitsToRequest, 50), async orgUnits => {
            const dataValuesPerOrgUnit = await this.dataValuesRepository.get({
                dataSetIds: [dataSet.id],
                orgUnitIds: orgUnits,
                periods: filters.periods.length ? filters.periods : defaultPeriods.map(x => x.value),
            });
            return dataValuesPerOrgUnit;
        });

        const dvByOrgUnitAndPeriods = _(dataValues)
            .flatten()
            .filter(dv => {
                return dataElementsByKey[dv.dataElement] ? true : false;
            })
            .groupBy(dv => `${dv.orgUnit}.${dv.period}`)
            .value();

        const keys = _(dvByOrgUnitAndPeriods).keys().value();

        const dataElementsAllowed = fixTotalSettings.dataElements.filter(
            de => !fixTotalSettings.excludeTotalDataElements.includes(de.total.id)
        );

        const results = _(keys)
            .map(key => {
                const dataValuesOrgPeriod = dvByOrgUnitAndPeriods[key];
                const [orgUnit, period] = key.split(".");
                if (!orgUnit || !period) {
                    throw Error("Cannot found orgUnit or period");
                }
                if (dataValuesOrgPeriod) {
                    const rows = _(dataElementsAllowed)
                        .map(dataElement => {
                            const totalDataElement = this.getDataValueDetails(
                                dataValuesOrgPeriod,
                                dataElement.total.id,
                                dataElement.total.cocId
                            );

                            // if total is already defined ignore the record
                            if (totalDataElement?.value) return undefined;

                            const practisingDe = this.getDataValueDetails(
                                dataValuesOrgPeriod,
                                dataElement.practising.id,
                                dataElement.practising.cocId
                            );
                            const practisingValue = practisingDe?.value;

                            const professionalDe = this.getDataValueDetails(
                                dataValuesOrgPeriod,
                                dataElement.professionallyActive.id,
                                dataElement.professionallyActive.cocId
                            );
                            const professionalValue = professionalDe?.value;

                            const licensedToPracticeDe = this.getDataValueDetails(
                                dataValuesOrgPeriod,
                                dataElement.licensedToPractise.id,
                                dataElement.licensedToPractise.cocId
                            );
                            const licensedToPracticeValue = licensedToPracticeDe?.value;

                            const comment = this.getDataValueComment(
                                practisingValue,
                                professionalValue,
                                licensedToPracticeValue
                            );

                            if (!comment) return undefined;

                            const dataElementTotalDetails = dataElementsByKey[dataElement.total.id];
                            if (!dataElementTotalDetails) return undefined;

                            const row: FixTotalsViewModel = {
                                id: `${key}.${dataElement.total.id}.${dataElement.total.cocId}`,
                                dataElement: dataElementTotalDetails,
                                period: period,
                                orgUnit: {
                                    id: orgUnit,
                                    name: orgUnitsByKey[orgUnit]?.name || "",
                                },
                                practising: practisingValue || "",
                                professionallyActive: professionalValue || "",
                                licensedToPractice: licensedToPracticeValue || "",
                                total: totalDataElement ? totalDataElement.value : "",
                                correctTotal: practisingValue || professionalValue || licensedToPracticeValue || "",
                                comment,
                            };

                            return row;
                        })
                        .compact()
                        .value();
                    return rows;
                }
                return undefined;
            })
            .compact()
            .flatten()
            .value();

        return results;
    }

    private getDataValueComment(
        practisingValue: string | undefined,
        professionalValue: string | undefined,
        licensedToPracticeValue: string | undefined
    ) {
        let comment = "";
        if (practisingValue) {
            comment = "Value obtained from Practising";
        } else if (professionalValue) {
            comment = "Value obtained from Professionally Active";
        } else if (licensedToPracticeValue) {
            comment = "Value obtained from Licensed to Practice";
        }
        return comment;
    }

    private getDataValueDetails(dataValuesOrgPeriod: DataValue[], dataElementId: Id, cocId: Id) {
        return dataValuesOrgPeriod.find(dv => dv.dataElement === dataElementId && dv.categoryOptionCombo === cocId);
    }

    private getPaginatedItems(items: FixTotalsViewModel[], page: number, pageSize: number) {
        const pg = page,
            pgSize = pageSize,
            offset = (pg - 1) * pgSize,
            pagedItems = _.drop(items, offset).slice(0, pgSize);
        return {
            page: pg,
            pageSize: pgSize,
            total: items.length,
            totalPages: Math.ceil(items.length / pgSize),
            rows: pagedItems,
        };
    }

    private getSortField(fieldName: string) {
        if (fieldName === "orgUnit") {
            return "orgUnit.name";
        } else if (fieldName === "dataElement") {
            return "dataElement.name";
        }
        return fieldName;
    }
}
