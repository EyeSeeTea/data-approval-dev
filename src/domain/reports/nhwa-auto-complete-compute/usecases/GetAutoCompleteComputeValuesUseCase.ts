import _ from "lodash";
import {
    AutoCompleteComputeViewModel,
    AutoCompleteComputeViewModelWithPaging,
} from "../../../../webapp/reports/nhwa-auto-complete-compute/NHWAAutoCompleteCompute";
import { CategoryOptionCombo, DataElement } from "../../../common/entities/DataSet";
import { DataSetRepository } from "../../../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../../../common/repositories/DataValuesRepository";
import { AutoCompleteComputeSettings, DataElementTotal } from "../entities/AutoCompleteComputeSettings";
import { DataValue } from "./../../../common/entities/DataValue";
import { promiseMap } from "../../../../utils/promises";

export type AutoCompleteComputeValuesFilter = {
    cacheKey: string;
    page: number;
    pageSize: number;
    sortingField: string;
    sortingOrder: "asc" | "desc";
    filters: { periods: string[]; orgUnits: string[] };
    settings: AutoCompleteComputeSettings;
};

export class GetAutoCompleteComputeValuesUseCase {
    dataCache: { key: string; value: AutoCompleteComputeViewModel[] } | undefined;

    constructor(private dataSetRepository: DataSetRepository, private dataValuesRepository: DataValuesRepository) {}

    async execute(options: AutoCompleteComputeValuesFilter): Promise<AutoCompleteComputeViewModelWithPaging> {
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

    private async getAllAutoCompleteValues(
        options: AutoCompleteComputeValuesFilter
    ): Promise<AutoCompleteComputeViewModel[]> {
        const { cacheKey, filters, settings } = options;
        if (this.dataCache && this.dataCache.key === cacheKey) return this.dataCache.value;

        const dataSets = await this.dataSetRepository.getById(settings.dataSet);
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
            const currentPeriods = filters.periods.length ? filters.periods : undefined;
            const dataValuesPerOrgUnit = await this.dataValuesRepository.get({
                dataSetIds: [dataSet.id],
                orgUnitIds: orgUnits,
                periods: currentPeriods,
                startDate: currentPeriods ? undefined : "1800",
                endDate: currentPeriods ? undefined : "2100",
            });
            return dataValuesPerOrgUnit;
        });

        const dvByOrgUnitAndPeriods = _(dataValues)
            .flatten()
            .groupBy(dv => `${dv.orgUnit}.${dv.period}`)
            .value();

        const keys = _(dvByOrgUnitAndPeriods).keys().value();
        const results = _(keys)
            .map(key => {
                const dataValuesOrgPeriod = dvByOrgUnitAndPeriods[key];
                const [orgUnit, period] = key.split(".");
                if (!orgUnit || !period) {
                    throw Error("Cannot found orgUnit or period");
                }

                if (dataValuesOrgPeriod) {
                    const rows = _(settings.dataElements)
                        .map(dataElement => {
                            const deDetails = this.getDataElementDetails(
                                dataElementsByKey,
                                dataElement.dataElementTotal
                            );

                            const catOptionCombo = deDetails.categoryCombo.categoryOptionCombos.find(
                                category => category.id === dataElement.categoryOptionCombo
                            );
                            const deTotal = dataValuesOrgPeriod.find(
                                dv => dv.dataElement === deDetails.id && dv.categoryOptionCombo === catOptionCombo?.id
                            );

                            const deChildren = this.getChildrenValues(
                                dataElement,
                                dataElementsByKey,
                                dataValuesOrgPeriod,
                                catOptionCombo
                            );

                            const allChildrenAreEmpty = deChildren.every(de => de.value === "" || _.isNull(de.value));

                            const valueToFix = allChildrenAreEmpty
                                ? "Empty"
                                : _(deChildren)
                                      .compact()
                                      .sumBy(de => Number(de.value) || 0);

                            const childrenResultSum = _(deChildren)
                                .map(de => de.value || "Empty")
                                .join(" + ");

                            const correctValue = `${childrenResultSum} = ${valueToFix}`;

                            if ((allChildrenAreEmpty && !deTotal?.value) || valueToFix === Number(deTotal?.value)) {
                                return undefined;
                            }

                            return {
                                id: `${key}.${deDetails.id}.${catOptionCombo?.id}`,
                                dataElement: {
                                    id: deDetails.id,
                                    name: deDetails.name,
                                },
                                orgUnit: {
                                    id: orgUnit,
                                    name: orgUnitsByKey[orgUnit]?.name || "",
                                },
                                period,
                                categoryOptionCombo: {
                                    id: catOptionCombo?.id || "",
                                    name: catOptionCombo?.name || "",
                                },
                                correctValue,
                                valueToFix: String(valueToFix),
                                currentValue: deTotal?.value,
                            };
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

        this.dataCache = {
            key: cacheKey,
            value: results,
        };

        return this.dataCache.value;
    }

    private getChildrenValues(
        dataElementTotal: DataElementTotal,
        dataElements: Record<string, DataElement>,
        dataValuesOrgPeriod: DataValue[],
        catOptionCombo: CategoryOptionCombo | undefined
    ) {
        return _(dataElementTotal.children)
            .map(deChild => {
                const deDetails = this.getDataElementDetails(dataElements, deChild.dataElement);
                const currentDe = dataValuesOrgPeriod.find(
                    dv => dv.dataElement === deDetails.id && dv.categoryOptionCombo === catOptionCombo?.id
                );
                return {
                    dataElement: currentDe?.dataElement || deChild.dataElement,
                    value: currentDe ? currentDe.value : "",
                };
            })
            .value();
    }

    private getDataElementDetails(dataElements: Record<string, DataElement>, dataElementName: string): DataElement {
        const deDetails = dataElements[dataElementName];
        if (!deDetails) {
            throw Error(`Cannot found data element: ${dataElementName}`);
        }
        return deDetails;
    }

    private getPaginatedItems(items: AutoCompleteComputeViewModel[], page: number, pageSize: number) {
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
        } else if (fieldName === "categoryOptionCombo") {
            return "categoryOptionCombo.name";
        } else if (fieldName === "dataElement") {
            return "dataElement.name";
        }
        return fieldName;
    }
}
