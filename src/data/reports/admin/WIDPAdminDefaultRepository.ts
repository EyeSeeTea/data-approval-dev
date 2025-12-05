import { D2Api } from "../../../types/d2-api";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { CsvData } from "../../common/CsvDataSource";
import { MetadataObject } from "../../../domain/common/entities/MetadataObject";
import {
    WIDPAdminRepository,
    WIDPAdmiRepositoryGetOptions,
} from "../../../domain/reports/admin/repositories/WIDPAdminRepository";
import _ from "lodash";

export class WIDPAdminDefaultRepository implements WIDPAdminRepository {
    constructor(private api: D2Api) {}
    async getInvalidSharingSetting(options: WIDPAdmiRepositoryGetOptions): Promise<MetadataObject[]> {
        const userGroupAccessesResult: any = await this.api.metadata.d2Api
            .get(
                "/metadata.json?filter=userGroupAccesses.access:in:[rwr-----,r-r-----]&fields=id,name,publicAccess,user[name,displayName],lastUpdatedBy[name,displayName],userGroupAccesses"
            )
            .getData();

        const publicAccessResult: any = await this.api.metadata.d2Api
            .get(
                "/metadata.json?filter=publicAccess:in:[rwr-----,r-r-----]&fields=id,name,publicAccess,user[name,displayName],lastUpdatedBy[name,displayName],userGroupAccesses"
            )
            .getData();

        return this.mapMetadataObjects(Object.assign(publicAccessResult, userGroupAccessesResult), options);
    }

    async getPublicMetadata(options: WIDPAdmiRepositoryGetOptions): Promise<Array<MetadataObject>> {
        const sqlView = "RIw9kc7N4g4";

        const result: any = await this.api.metadata.d2Api.get("/sqlViews/" + sqlView + "/data?paging=false").getData();
        const data = result.listGrid.rows.map((row: any[]) => ({
            Id: row[1],
        }));

        const comma_seprated = data.map((item: { [x: string]: any }) => item["Id"]);
        const metadataResult: any = await this.api.metadata.d2Api
            .get(
                "/metadata.json?fields=id,name,created,createdBy[name],lastUpdated,publicAccess,user[name,displayName],lastUpdatedBy[name,displayName],userGroupAccesses&filter=id:in:[" +
                    comma_seprated +
                    "]"
            )
            .getData();
        return this.mapMetadataObjects(metadataResult, options);
    }

    async save(filename: string, metadataObjects: MetadataObject[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = metadataObjects.map(
            (metadataObject): MetadataRow => ({
                metadataType: metadataObject.metadataType,
                id: metadataObject.Id,
                name: metadataObject.name,
                publicAccess: metadataObject.publicAccess,
                userGroupAccess: metadataObject.userGroupAccess || "-",
                userAccess: metadataObject.userAccess || "-",
                createdBy: metadataObject.createdBy || "-",
                lastUpdatedBy: metadataObject.lastUpdatedBy || "-",
                created: metadataObject.created || "-",
                lastUpdated: metadataObject.lastUpdated || "-",
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }

    mapMetadataObjects(metadataResult: any, options: WIDPAdmiRepositoryGetOptions) {
        const metadataValues = (Object.keys(metadataResult) as Array<keyof typeof metadataResult>).reduce(
            (accumulator, current) => {
                if (!options.removeTypes.includes(String(current)) && current !== "system") {
                    const item: any = metadataResult[current].map((row: { [x: string]: any }) => ({
                        Id: row["id"],
                        name: row["name"],
                        publicAccess: row["publicAccess"],
                        userGroupAccess: row["userGroupAccesses"] ?? "-",
                        userAccess: row["userAccesses"] ?? "-",
                        createdBy: row["createdBy"] ?? "-",
                        lastUpdatedBy: row["lastUpdatedBy"] ?? "-",
                        created: row["created"] ?? "-",
                        lastUpdated: row["lastUpdated"] ?? "-",
                        metadataType: current,
                    }));
                    accumulator.push(item);
                }
                return accumulator;
            },
            [] as typeof metadataResult[keyof typeof metadataResult][]
        );

        if (options.sorting.direction === "desc") {
            return _.sortBy(metadataValues.flat(1), options.sorting.field, options.sorting.direction).reverse();
        }
        return _.sortBy(metadataValues.flat(1), options.sorting.field, options.sorting.direction);
    }
}

const csvFields = [
    "metadataType",
    "id",
    "name",
    "publicAccess",
    "userGroupAccess",
    "userAccess",
    "createdBy",
    "lastUpdatedBy",
    "created",
    "lastUpdated",
] as const;

type CsvField = typeof csvFields[number];

type MetadataRow = Record<CsvField, string>;
