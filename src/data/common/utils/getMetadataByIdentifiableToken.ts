import { CodedRef } from "../../../domain/common/entities/Ref";
import { D2Api } from "../../../types/d2-api";

export async function getMetadataByIdentifiableToken(options: {
    api: D2Api;
    metadataType: MetadataType;
    token: string;
}): Promise<CodedRef> {
    const { api, metadataType, token: identifiableValue } = options;

    return api.metadata
        .get({
            [metadataType]: {
                filter: {
                    identifiable: {
                        token: identifiableValue,
                    },
                },
                fields: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        })
        .getData()
        .then(response => {
            const metadata = response[metadataType][0];
            if (!metadata) throw new Error(`Metadata not found for ${metadataType} with id ${identifiableValue}`);

            return metadata;
        });
}

const metadataTypes = ["dataElements", "dataSets", "categoryOptionCombos", "organisationUnits"] as const;
type MetadataType = typeof metadataTypes[number];
