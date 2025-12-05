import _ from "lodash";
import { DataValue, DataValuesSelector, DataValueToPost } from "../../domain/common/entities/DataValue";
import { Stats } from "../../domain/common/entities/Stats";
import { DataValuesRepository } from "../../domain/common/repositories/DataValuesRepository";
import { D2Api } from "../../types/d2-api";
import { getInChunks, promiseMap } from "../../utils/promises";

const emptyImportResult = { deleted: 0, ignored: 0, imported: 0, updated: 0, errorMessages: [] };

export class DataValuesD2Repository implements DataValuesRepository {
    constructor(private api: D2Api) {}

    async get(options: DataValuesSelector): Promise<DataValue[]> {
        const res$ = this.api.dataValues.getSet({
            dataSet: options.dataSetIds || [],
            orgUnit: options.orgUnitIds || [],
            period: options.periods,
            startDate: options.startDate,
            endDate: options.endDate,
            children: options.children,
        });

        const res = await res$.getData();

        const dataElementIds = res.dataValues.map(dataValue => dataValue.dataElement);

        const dataElements = await getInChunks(dataElementIds, async deIds => {
            const responseDes = await this.api.models.dataElements
                .get({
                    fields: { id: true, name: true },
                    filter: { id: { in: deIds } },
                    pageSize: 500,
                })
                .getData();

            return _(responseDes.objects)
                .map(d2DataElement => {
                    return [d2DataElement.id, d2DataElement.name];
                })
                .value();
        });

        const dataElementsById = _(dataElements).fromPairs().value();

        return res.dataValues.map(dataValue => {
            return {
                ...dataValue,
                dataElementName: dataElementsById[dataValue.dataElement] || "",
            };
        });
    }

    async saveAll(dataValues: DataValueToPost[]): Promise<Stats> {
        return this.saveDataValues(dataValues, "CREATE_AND_UPDATE");
    }

    async deleteAll(dataValues: DataValueToPost[]): Promise<Stats> {
        return this.saveDataValues(dataValues, "DELETE");
    }

    async saveDataValues(
        dataValues: DataValueToPost[],
        importStrategy: "CREATE_AND_UPDATE" | "DELETE"
    ): Promise<Stats> {
        if (_.isEmpty(dataValues)) return emptyImportResult;

        const result = await promiseMap(_.chunk(dataValues, 25), async dataValues => {
            try {
                const res = (await this.api.dataValues
                    .postSet({ importStrategy }, { dataValues })
                    .getData()) as unknown as ResponseDataValues;

                return {
                    ...res.response.importCount,
                    errorMessages: this.buildConflictsErrors(res.response.conflicts),
                };
            } catch (error) {
                const dvError = error as unknown as ResponseErrorDataValue;

                const ignoreDetails = this.buildConflictsErrors(dvError.response?.data?.response?.conflicts || []);
                return {
                    ...(dvError.response?.data?.response?.importCount || emptyImportResult),
                    errorMessages: ignoreDetails,
                };
            }
        });

        return {
            imported: _(result).sumBy(x => x.imported || 0),
            updated: _(result).sumBy(x => x.updated || 0),
            ignored: _(result).sumBy(x => x.ignored || 0),
            deleted: _(result).sumBy(x => x.deleted || 0),
            errorMessages: _(result)
                .flatMap(message => message.errorMessages || [])
                .value(),
        };
    }

    private buildConflictsErrors(conflicts: D2ConflictDataValue[]): Stats["errorMessages"] {
        return conflicts.map(conflict => {
            return { id: conflict.object, message: `ERROR: ${conflict.errorCode}: ${conflict.value}` };
        });
    }
}

type ResponseDataValues = {
    status: string;
    response: ResponseDataValue;
};

type ResponseErrorDataValue = {
    status: string;
    response?: { data?: { response?: ResponseDataValue } };
};

type ResponseDataValue = {
    conflicts: D2ConflictDataValue[];
    importCount: { imported: number; updated: 0; ignored: 0; deleted: 0 };
};

type D2ConflictDataValue = { object: string; value: string; errorCode: string };
