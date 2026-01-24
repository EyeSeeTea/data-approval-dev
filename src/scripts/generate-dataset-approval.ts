import _ from "lodash";
import "dotenv-flow/config";
import fs from "fs";
import { D2Api } from "../types/d2-api";
import { ArgumentParser } from "argparse";
import { getUidFromSeed } from "../utils/uid";
import { getInChunks } from "../utils/promises";
import { DATA_ELEMENT_SUFFIX } from "../domain/common/entities/AppSettings";

const SUFFIX = DATA_ELEMENT_SUFFIX;
const MAX_SHORT_NAME_LENGTH = 50;
const MAX_NAME_LENGTH = 230;

async function main() {
    const parser = new ArgumentParser({
        description: "Generate DataSet Approval from an existing DataSet",
    });

    parser.add_argument("-ds", "--dataSet", {
        help: "DataSet code",
        required: true,
    });

    parser.add_argument("--post", {
        help: "Commit changes to DHIS2 (default: validate only)",
        default: false,
        action: "storeTrue",
    });

    parser.add_argument("--dataElement-submission", {
        help: "Name/code for submission datetime dataElement",
        required: true,
    });

    parser.add_argument("--dataElement-approval", {
        help: "Name/code for approval datetime dataElement",
        required: true,
    });

    try {
        const args = parser.parse_args();
        const baseUrl = process.env.REACT_APP_DHIS2_BASE_URL || "";
        const authString = process.env.REACT_APP_DHIS2_AUTH || "";

        const [username, password] = authString.split(":", 2);
        if (!username || !password) throw new Error("Invalid DHIS2 authentication");

        const api = new D2Api({ baseUrl, auth: { username, password } });

        await generateDataSetApproval({
            api,
            dataSetCode: args.dataSet,
            commit: args.post,
            dataElementSubmission: args.dataElement_submission,
            dataElementApproval: args.dataElement_approval,
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

type WarningDataElement = {
    id: string;
    name: string;
    reason: string;
};

type SkippedSection = {
    id: string;
    name: string;
    reason: string;
};

type D2Section = {
    id: string;
    name: string;
    code: string;
    sortOrder?: number;
    dataSet: { id: string };
    dataElements: Array<{ id: string }>;
    greyedFields: Array<{
        dataElement: { id: string };
        categoryOptionCombo: { id: string };
    }>;
    [key: string]: unknown;
};

type NewSection = Omit<D2Section, "dataSet"> & {
    id: string;
    name: string;
    code: string;
    dataSet: { id: string };
    dataElements: Array<{ id: string }>;
    greyedFields: Array<{
        dataElement: { id: string };
        categoryOptionCombo: { id: string };
    }>;
};

async function generateDataSetApproval(options: {
    api: D2Api;
    dataSetCode: string;
    commit: boolean;
    dataElementSubmission?: string;
    dataElementApproval?: string;
}): Promise<void> {
    const { api, dataSetCode, commit, dataElementSubmission, dataElementApproval } = options;

    const originalDataSet = await getDataSetByCode(api, dataSetCode);

    const dataElementIds = originalDataSet.dataSetElements?.map(dse => dse.dataElement.id) ?? [];

    const originalDataElements = await getDataElementsDetails(api, dataElementIds);

    const { validDataElements, warningDataElements } = filterDataElementsWithCode(originalDataElements);

    if (warningDataElements.length > 0) {
        saveWarningDataElementsToFile(warningDataElements, dataSetCode);
        console.warn(
            `Warning: ${warningDataElements.length} dataElement(s) without code. See warnings file for details.`
        );
    }

    const newDataElements = validDataElements.map(transformDataElement);

    const submissionDE = dataElementSubmission ? [createCustomDataElement(dataElementSubmission)] : [];
    const approvalDE = dataElementApproval ? [createCustomDataElement(dataElementApproval)] : [];
    const customDataElements = [...submissionDE, ...approvalDE];

    const allNewDataElements = [...newDataElements, ...customDataElements];

    const dataElementIdMap = createDataElementIdMap(validDataElements, newDataElements);

    const originalSections = await getSectionsByDataSet(api, originalDataSet.id);

    const { validSections, skippedSections } = filterSectionsWithCode(originalSections);

    if (skippedSections.length > 0) {
        saveSkippedSectionsToFile(skippedSections, dataSetCode);
        console.warn(`Skipped ${skippedSections.length} section(s) without code. See skipped file for details.`);
    }

    const newDataSetId = getUidFromSeed(addSuffix(originalDataSet.code));

    const newSections = validSections.map(section => transformSection(section, newDataSetId, dataElementIdMap));

    const newDataSet = transformDataSet(
        originalDataSet,
        dataElementIdMap,
        newSections.map(s => s.id),
        customDataElements.map(de => de.id)
    );

    const existingMetadata = await getExistingMetadata(
        api,
        newDataSet.id,
        allNewDataElements.map(de => de.id),
        newSections.map(s => s.id)
    );

    const finalMetadata = mergeWithExisting(
        { dataSets: [newDataSet], dataElements: allNewDataElements, sections: newSections },
        existingMetadata
    );

    const filename = saveToFile(finalMetadata, dataSetCode);
    console.debug(`Metadata saved to: ${filename}`);

    const importMode = commit ? "COMMIT" : "VALIDATE";
    await persistMetadata(api, finalMetadata, importMode, dataSetCode);
}

function filterDataElementsWithCode(dataElements: D2DataElement[]): {
    validDataElements: D2DataElement[];
    warningDataElements: WarningDataElement[];
} {
    const warningDataElements: WarningDataElement[] = [];

    for (const de of dataElements) {
        if (!de.code || de.code.trim() === "") {
            warningDataElements.push({
                id: de.id,
                name: de.name,
                reason: "DataElement does not have a code - cloned with empty code",
            });
        }
    }

    return { validDataElements: dataElements, warningDataElements };
}

function saveWarningDataElementsToFile(warnings: WarningDataElement[], dataSetCode: string): void {
    const timestamp = Date.now();
    const filename = `warnings_dataelements_${dataSetCode}_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(warnings, null, 2));
    console.debug(`Warning dataElements saved to: ${filename}`);
}

type D2DataSet = {
    id: string;
    name: string;
    shortName: string;
    code: string;
    workflow?: { id: string };
    dataEntryForm?: { id: string };
    dataSetElements?: Array<{
        dataElement: { id: string };
        categoryCombo?: { id: string };
    }>;
    sections?: Array<{ id: string }>;
    [key: string]: unknown;
};

type D2DataElement = {
    id: string;
    name: string;
    shortName: string;
    code: string;
    dataElementGroups?: unknown[];
    dataSetElements?: unknown[];
    [key: string]: unknown;
};

type NewDataSet = Omit<D2DataSet, "workflow" | "dataEntryForm" | "sections"> & {
    id: string;
    name: string;
    shortName: string;
    code: string;
    dataSetElements: Array<{
        dataElement: { id: string };
        categoryCombo?: { id: string };
    }>;
    sections: Array<{ id: string }>;
};

type NewDataElement = Omit<D2DataElement, "dataElementGroups" | "dataSetElements"> & {
    id: string;
    name: string;
    shortName: string;
    code: string;
};

type Metadata = {
    dataSets: NewDataSet[];
    dataElements: NewDataElement[];
    sections: NewSection[];
};

type ExistingMetadata = {
    dataSet?: D2DataSet;
    dataElements: D2DataElement[];
    sections: D2Section[];
};

async function getDataSetByCode(api: D2Api, code: string): Promise<D2DataSet> {
    const response = await api.models.dataSets
        .get({
            fields: { $owner: true },
            filter: { code: { eq: code } },
            paging: false,
        })
        .getData();

    const dataSet = response.objects[0];
    if (!dataSet) {
        throw new Error(`DataSet with code '${code}' not found`);
    }

    return dataSet;
}

async function getDataElementsDetails(api: D2Api, ids: string[]): Promise<D2DataElement[]> {
    if (ids.length === 0) return [];

    return getInChunks(ids, async idsChunk => {
        const response = await api.models.dataElements
            .get({
                fields: { $owner: true },
                filter: { id: { in: idsChunk } },
                paging: false,
            })
            .getData();

        return response.objects;
    });
}

async function getSectionsByDataSet(api: D2Api, dataSetId: string): Promise<D2Section[]> {
    const response = await api.models.sections
        .get({
            fields: {
                $owner: true,
                greyedFields: { dataElement: { id: true }, categoryOptionCombo: { id: true } },
            },
            filter: { "dataSet.id": { eq: dataSetId } },
            paging: false,
        })
        .getData();

    return response.objects as unknown as D2Section[];
}

function filterSectionsWithCode(sections: D2Section[]): {
    validSections: D2Section[];
    skippedSections: SkippedSection[];
} {
    const validSections: D2Section[] = [];
    const skippedSections: SkippedSection[] = [];

    for (const section of sections) {
        if (section.code && section.code.trim() !== "") {
            validSections.push(section);
        } else {
            skippedSections.push({
                id: section.id,
                name: section.name,
                reason: "Section does not have a code and cannot be cloned",
            });
        }
    }

    return { validSections, skippedSections };
}

function saveSkippedSectionsToFile(skipped: SkippedSection[], dataSetCode: string): void {
    const timestamp = Date.now();
    const filename = `skipped_sections_${dataSetCode}_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(skipped, null, 2));
    console.debug(`Skipped sections saved to: ${filename}`);
}

function addSuffix(value: string): string {
    return `${value}${SUFFIX}`;
}

function ensureSuffix(value: string): string {
    return value.endsWith(SUFFIX) ? value : addSuffix(value);
}

function createCustomDataElement(name: string): NewDataElement {
    const nameWithSuffix = ensureSuffix(name);
    const shortName = nameWithSuffix.substring(0, MAX_SHORT_NAME_LENGTH);
    const id = getUidFromSeed(nameWithSuffix);

    return {
        id,
        name: nameWithSuffix,
        shortName,
        code: nameWithSuffix,
        valueType: "DATETIME" as const,
        domainType: "AGGREGATE" as const,
        aggregationType: "NONE" as const,
    };
}

function transformDataElement(original: D2DataElement): NewDataElement {
    const { dataElementGroups: _deGroups, dataSetElements: _dsElements, id: _id, ...rest } = original;

    const hasCode = original.code && original.code.trim() !== "";
    const newCode = hasCode ? addSuffixAndTruncate(original.code, MAX_SHORT_NAME_LENGTH) : "";
    const newId = hasCode ? getUidFromSeed(newCode) : getUidFromSeed(addSuffix(original.id));

    return {
        ...rest,
        id: newId,
        name: addSuffixAndTruncate(original.name, MAX_NAME_LENGTH),
        shortName: addSuffixAndTruncate(original.shortName, MAX_SHORT_NAME_LENGTH),
        code: newCode,
    };
}

function addSuffixAndTruncate(code: string | undefined, maxLength: number): string {
    if (!code) return "";

    const codeLen = code.length;

    if (codeLen + SUFFIX.length <= maxLength) {
        return addSuffix(code);
    } else {
        const truncatedCode = code.substring(0, maxLength - SUFFIX.length);
        return addSuffix(truncatedCode);
    }
}

function createDataElementIdMap(originals: D2DataElement[], transformed: NewDataElement[]): Record<string, string> {
    const map: Record<string, string> = {};
    originals.forEach((original, index) => {
        const newElement = transformed[index];
        if (newElement) {
            map[original.id] = newElement.id;
        }
    });
    return map;
}

function transformSection(
    original: D2Section,
    newDataSetId: string,
    dataElementIdMap: Record<string, string>
): NewSection {
    const { id: _id, dataSet: _dataSet, ...rest } = original;

    const newCode = addSuffix(original.code);
    const newId = getUidFromSeed(newCode);

    const newDataElements = _(original.dataElements ?? [])
        .map(de => {
            const newId = dataElementIdMap[de.id];
            return newId ? { id: newId } : undefined;
        })
        .compact()
        .value();

    const newGreyedFields = _(original.greyedFields ?? [])
        .map(gf => {
            const newDataElementId = dataElementIdMap[gf.dataElement.id];
            return newDataElementId
                ? {
                      dataElement: { id: newDataElementId },
                      categoryOptionCombo: { id: gf.categoryOptionCombo.id },
                  }
                : undefined;
        })
        .compact()
        .value();

    return {
        ...rest,
        id: newId,
        name: addSuffix(original.name),
        code: newCode,
        dataSet: { id: newDataSetId },
        dataElements: newDataElements,
        greyedFields: newGreyedFields,
    };
}

function transformDataSet(
    original: D2DataSet,
    dataElementIdMap: Record<string, string>,
    newSectionIds: string[],
    customDataElementIds: string[] = []
): NewDataSet {
    const { workflow: _workflow, dataEntryForm: _dataEntryForm, id: _id, sections: _sections, ...rest } = original;

    const newCode = addSuffix(original.code);
    const newId = getUidFromSeed(newCode);

    const newDataSetElements = (original.dataSetElements ?? [])
        .filter(dse => dataElementIdMap[dse.dataElement.id] !== undefined)
        .map(dse => {
            const newDataElementId = dataElementIdMap[dse.dataElement.id];
            if (!newDataElementId) {
                throw new Error(`DataElement id mapping not found for: ${dse.dataElement.id}`);
            }

            return {
                dataElement: { id: newDataElementId },
                ...(dse.categoryCombo ? { categoryCombo: { id: dse.categoryCombo.id } } : {}),
            };
        });

    const customDataSetElements = customDataElementIds.map(id => ({
        dataElement: { id },
    }));

    return {
        ...rest,
        id: newId,
        name: addSuffix(original.name),
        shortName: addSuffix(original.shortName),
        code: newCode,
        dataSetElements: [...newDataSetElements, ...customDataSetElements],
        sections: newSectionIds.map(id => ({ id })),
    };
}

async function getExistingMetadata(
    api: D2Api,
    dataSetId: string,
    dataElementIds: string[],
    sectionIds: string[]
): Promise<ExistingMetadata> {
    const dataSetResponse = await api.models.dataSets
        .get({
            fields: { $owner: true },
            filter: { id: { eq: dataSetId } },
            paging: false,
        })
        .getData();

    const existingDataSet = dataSetResponse.objects[0];

    const existingDataElements = await getInChunks(dataElementIds, async idsChunk => {
        const response = await api.models.dataElements
            .get({
                fields: { $owner: true },
                filter: { id: { in: idsChunk } },
                paging: false,
            })
            .getData();

        return response.objects;
    });

    const existingSections =
        sectionIds.length > 0
            ? await getInChunks(sectionIds, async idsChunk => {
                  const response = await api.models.sections
                      .get({
                          fields: {
                              $owner: true,
                              greyedFields: { dataElement: { id: true }, categoryOptionCombo: { id: true } },
                          },
                          filter: { id: { in: idsChunk } },
                          paging: false,
                      })
                      .getData();

                  return response.objects as unknown as D2Section[];
              })
            : [];

    return {
        dataSet: existingDataSet,
        dataElements: existingDataElements,
        sections: existingSections,
    };
}

function mergeWithExisting(newMetadata: Metadata, existingMetadata: ExistingMetadata): Metadata {
    const newDataSet = newMetadata.dataSets[0];
    const mergedDataSet = existingMetadata.dataSet ? { ...existingMetadata.dataSet, ...newDataSet } : newDataSet;

    const existingDataElementMap = new Map(existingMetadata.dataElements.map(de => [de.id, de]));

    const mergedDataElements = newMetadata.dataElements.map(newDE => {
        const existingDE = existingDataElementMap.get(newDE.id);
        return existingDE ? { ...existingDE, ...newDE } : newDE;
    });

    const existingSectionMap = new Map(existingMetadata.sections.map(s => [s.id, s]));

    const mergedSections = newMetadata.sections.map(newSection => {
        const existingSection = existingSectionMap.get(newSection.id);
        return existingSection ? { ...existingSection, ...newSection } : newSection;
    });

    return {
        dataSets: [mergedDataSet as NewDataSet],
        dataElements: mergedDataElements,
        sections: mergedSections,
    };
}

function saveToFile(metadata: Metadata, dataSetCode: string): string {
    const timestamp = Date.now();
    const filename = `${dataSetCode}_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(metadata, null, 2));
    return filename;
}

type ErrorReport = {
    message: string;
    mainKlass: string;
    errorKlass: string;
    errorProperty: string;
    errorCode: string;
};

type ObjectReport = {
    klass: string;
    index: number;
    uid: string;
    errorReports: ErrorReport[];
};

type TypeReport = {
    klass: string;
    stats: { created: number; updated: number; deleted: number; ignored: number; total: number };
    objectReports: ObjectReport[];
};

type MetadataResponse = {
    status: "OK" | "ERROR";
    stats: { created: number; updated: number; deleted: number; ignored: number; total: number };
    typeReports: TypeReport[];
};

async function persistMetadata(
    api: D2Api,
    metadata: Metadata,
    importMode: "COMMIT" | "VALIDATE",
    dataSetCode: string
): Promise<void> {
    try {
        const response = await api.metadata
            .post(
                {
                    dataSets: metadata.dataSets,
                    dataElements: metadata.dataElements,
                    sections: metadata.sections,
                },
                { importMode }
            )
            .getData();

        console.debug(
            `Metadata ${importMode === "COMMIT" ? "saved" : "validated"} in DHIS2. Response: ${JSON.stringify(
                response.stats
            )}`
        );

        const errors = extractErrorsFromTypeReports(response.typeReports);
        if (errors.length > 0) {
            saveErrorsToFile(errors, dataSetCode);
        }
    } catch (err: unknown) {
        if (isHttpError(err)) {
            const responseData = err.response?.data?.response as MetadataResponse | undefined;
            if (responseData?.typeReports) {
                const errors = extractErrorsFromTypeReports(responseData.typeReports);
                saveErrorsToFile(errors, dataSetCode);
                console.error(`Validation failed with ${errors.length} error(s). See errors file for details.`);
            }
        }
        throw err;
    }
}

function isHttpError(err: unknown): err is { response?: { data?: { response?: unknown } } } {
    return typeof err === "object" && err !== null && "response" in err;
}

type ExtractedError = {
    klass: string;
    uid: string;
    index: number;
    errorCode: string;
    errorProperty: string;
    message: string;
};

function extractErrorsFromTypeReports(typeReports: TypeReport[]): ExtractedError[] {
    const errors: ExtractedError[] = [];

    for (const typeReport of typeReports) {
        for (const objectReport of typeReport.objectReports) {
            for (const errorReport of objectReport.errorReports) {
                errors.push({
                    klass: typeReport.klass,
                    uid: objectReport.uid,
                    index: objectReport.index,
                    errorCode: errorReport.errorCode,
                    errorProperty: errorReport.errorProperty,
                    message: errorReport.message,
                });
            }
        }
    }

    return errors;
}

function saveErrorsToFile(errors: ExtractedError[], dataSetCode: string): void {
    const timestamp = Date.now();
    const filename = `errors_${dataSetCode}_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(errors, null, 2));
    console.debug(`Errors saved to: ${filename}`);
}

main();
