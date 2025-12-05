import _ from "lodash";
import { AppSettings, isValidApprovalDataElement } from "../common/entities/AppSettings";
import { Id } from "../common/entities/Base";
import { DataValue } from "../common/entities/DataValue";
import { DataSetRepository } from "../common/repositories/DataSetRepository";
import { DataValuesRepository } from "../common/repositories/DataValuesRepository";
import { DataDiffItem } from "./mal-data-approval/entities/DataDiffItem";

export const dataSetApprovalName = "MAL - WMR Form-APVD";

export class WmrDiffReport {
    constructor(
        private dataValueRepository: DataValuesRepository,
        private dataSetRepository: DataSetRepository,
        private settings: AppSettings
    ) {}

    async getDiff(dataSetId: Id, orgUnitId: Id, period: string, children = false): Promise<DataDiffItem[]> {
        const dataElements = await this.getDataElements(dataSetId);
        const dataSet = await this.dataSetRepository.getById(dataSetId);
        const originalDataSet = dataSet[0];
        if (!originalDataSet) throw Error(`No data set found: ${dataSetId}`);
        const settings = this.settings.dataSets[originalDataSet.code];
        if (!settings) throw Error(`No settings found for data set: ${originalDataSet.code}`);

        const dataSetApproval = await this.dataSetRepository.getByNameOrCode(settings.approvalDataSetCode);
        const approvalDataValues = await this.getDataValues(dataSetApproval.id, orgUnitId, period, children);
        const malDataValues = await this.getDataValues(dataSetId, orgUnitId, period, children);

        // TODO: Refactor this method to use a more efficient approach
        // this class was not created to deal with dataValues from multiple org units (children = true)
        const dataElementsWithValues = this.filterDataElementsWithDataValue(
            malDataValues,
            approvalDataValues,
            dataElements,
            dataSetId,
            period
        );

        return dataElementsWithValues;
    }

    private async getDataValues(
        dataSetId: Id,
        orgUnitId: Id,
        period: string,
        children?: boolean
    ): Promise<DataValue[]> {
        const dataValues = await this.dataValueRepository.get({
            dataSetIds: [dataSetId],
            periods: [period],
            orgUnitIds: [orgUnitId],
            children: children,
        });
        return dataValues;
    }

    private async getDataElements(dataSetId: Id): Promise<DataElementsWithCombination[]> {
        const dataSets = await this.dataSetRepository.getById(dataSetId);
        const dataSet = _(dataSets).first();
        if (!dataSet) throw Error("No data set found");
        return dataSet.dataElements.flatMap(dataElement => {
            const combinations = dataElement.categoryCombo?.categoryOptionCombos || [];

            return combinations.map((combination): DataElementsWithCombination => {
                return {
                    dataValueId: `${dataElement.id}.${combination.id}`,
                    id: dataElement.id,
                    categoryOptionCombo: combination.id,
                    categoryOptionComboName: combination.name === "default" ? "" : combination.name,
                    name: dataElement.originalName,
                };
            });
        });
    }

    private filterDataElementsWithDataValue(
        malariaDataValues: DataValue[],
        approvalDataValues: DataValue[],
        dataElements: DataElementsWithCombination[],
        malariaDataSetId: Id,
        period: string
    ): DataDiffItem[] {
        const malariaOrgUnits = _(malariaDataValues)
            .map(dataValue => dataValue.orgUnit)
            .uniq()
            .value();

        const apvdOrgUnits = _(approvalDataValues)
            .map(dataValue => dataValue.orgUnit)
            .uniq()
            .value();

        const allOrgUnits = _(malariaOrgUnits).concat(apvdOrgUnits).uniq().value();

        return allOrgUnits.flatMap(orgUnitId => {
            return _(dataElements)
                .map(dataElement => {
                    const malariaDataValue = _(malariaDataValues).find(
                        dataValue =>
                            dataValue.dataElement === dataElement.id &&
                            dataValue.categoryOptionCombo === dataElement.categoryOptionCombo &&
                            dataValue.orgUnit === orgUnitId &&
                            dataValue.period === period
                    );

                    const approvalDataValue = _(approvalDataValues).find(
                        dataValue =>
                            isValidApprovalDataElement(dataElement.name, dataValue.dataElementName) &&
                            dataValue.categoryOptionCombo === dataElement.categoryOptionCombo &&
                            dataValue.orgUnit === orgUnitId &&
                            dataValue.period === period
                    );

                    if (!malariaDataValue && !approvalDataValue) return undefined;
                    if (!malariaDataValue?.value && !approvalDataValue?.value) return undefined;
                    if (malariaDataValue?.value === approvalDataValue?.value) return undefined;

                    return {
                        dataSetUid: malariaDataSetId,
                        orgUnitUid: orgUnitId,
                        period: period,
                        value: approvalDataValue && !malariaDataValue ? "" : malariaDataValue?.value,
                        dataElement: this.buildDataElementNameWithCombination(dataElement),
                        comment: malariaDataValue?.comment,
                        apvdDataElement: approvalDataValue?.dataElement,
                        apvdValue: approvalDataValue?.value,
                        apvdComment: approvalDataValue?.comment,
                        attributeOptionCombo:
                            malariaDataValue?.attributeOptionCombo ?? approvalDataValue?.attributeOptionCombo,
                        categoryOptionCombo:
                            malariaDataValue?.categoryOptionCombo ?? approvalDataValue?.categoryOptionCombo,
                        dataElementBasicName: dataElement.name,
                    };
                })
                .compact()
                .value();
        });
    }

    private buildDataElementNameWithCombination(dataElement: DataElementsWithCombination): string {
        return dataElement.categoryOptionComboName
            ? `${dataElement.name} - (${dataElement.categoryOptionComboName})`
            : dataElement.name;
    }
}

type DataElementsWithCombination = {
    dataValueId: string;
    id: Id;
    categoryOptionCombo: Id;
    categoryOptionComboName: string;
    name: string;
};
