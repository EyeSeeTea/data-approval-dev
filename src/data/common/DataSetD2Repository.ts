import { Id } from "../../domain/common/entities/Base";
import { DataSet } from "../../domain/common/entities/DataSet";
import { OrgUnit } from "../../domain/common/entities/OrgUnit";
import { DataSetRepository } from "../../domain/common/repositories/DataSetRepository";
import { D2Api } from "../../types/d2-api";

export class DataSetD2Repository implements DataSetRepository {
    constructor(private api: D2Api) {}

    async getByNameOrCode(nameOrCode: string): Promise<DataSet> {
        return this.api.metadata
            .get({
                dataSets: {
                    fields: { id: true, code: true, name: true, organisationUnits: { id: true, name: true } },
                    filter: { identifiable: { eq: nameOrCode } },
                },
            })
            .getData()
            .then(response => {
                const dataSet = response.dataSets[0];
                if (!dataSet) throw new Error(`DataSet not found: ${nameOrCode}`);

                return {
                    dataElements: [],
                    code: dataSet.code,
                    id: dataSet.id,
                    name: dataSet.name,
                    organisationUnits: dataSet.organisationUnits.map(
                        (ou): OrgUnit => ({
                            id: ou.id,
                            name: ou.name,
                            path: "",
                            children: [],
                            level: 0,
                        })
                    ),
                };
            });
    }

    async getById(id: Id): Promise<DataSet[]> {
        return this.api.metadata
            .get({
                dataSets: {
                    fields: dataSetFields,
                    filter: { id: { eq: id } },
                },
            })
            .getData()
            .then(response => {
                return response.dataSets.map(d2DataSet => {
                    return {
                        id: d2DataSet.id,
                        name: d2DataSet.name,
                        code: d2DataSet.code,
                        dataElements: d2DataSet.dataSetElements.map(d2DataElement => {
                            return {
                                id: d2DataElement.dataElement.id,
                                name: d2DataElement.dataElement.formName || d2DataElement.dataElement.name,
                                originalName: d2DataElement.dataElement.name,
                                code: d2DataElement.dataElement.code,
                                categoryCombo: d2DataElement.dataElement.categoryCombo,
                            };
                        }),
                        organisationUnits: d2DataSet.organisationUnits.map(d2OrgUnit => {
                            return {
                                id: d2OrgUnit.id,
                                name: d2OrgUnit.displayName,
                                level: d2OrgUnit.level,
                                path: "",
                                children: [],
                            };
                        }),
                    };
                });
            });
    }
}

const dataSetFields = {
    id: true,
    name: true,
    code: true,
    dataSetElements: {
        dataElement: {
            id: true,
            code: true,
            name: true,
            formName: true,
            categoryCombo: {
                id: true,
                code: true,
                name: true,
                categoryOptionCombos: {
                    id: true,
                    code: true,
                    name: true,
                },
            },
        },
    },
    organisationUnits: {
        id: true,
        displayName: true,
        level: true,
    },
};
