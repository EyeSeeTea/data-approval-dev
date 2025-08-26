import { D2Api, Id } from "../types/d2-api";
import { ArgumentParser } from "argparse";
import "dotenv-flow/config";
import {
    MAL_WMR_FORM_CODE,
    MalDataApprovalDefaultRepository,
} from "../data/reports/mal-data-approval/MalDataApprovalDefaultRepository";
import { DataValuesD2Repository } from "../data/common/DataValuesD2Repository";
import { DataSetD2Repository } from "../data/common/DataSetD2Repository";
import { getMetadataByIdentifiableToken } from "../data/common/utils/getMetadataByIdentifiableToken";
import _ from "lodash";
import { CodedRef } from "../domain/common/entities/Ref";
import { WmrDiffReport } from "../domain/reports/WmrDiffReport";
import { promiseMap } from "../utils/promises";
import { DataDiffItemIdentifier } from "../domain/reports/mal-data-approval/entities/DataDiffItem";
import { ApproveMalDataValuesUseCase } from "../domain/reports/mal-data-approval/usecases/ApproveMalDataValuesUseCase";
import { writeFileSync } from "fs";
import { AppSettingsD2Repository } from "../data/AppSettingsD2Repository";

const GLOBAL_OU = "WHO-HQ";
const DEFAULT_START_YEAR = 2005;
const DEFAULT_END_YEAR = new Date().getFullYear() - 2;

type ApprovalOptions = {
    baseUrl: string;
    authString: string;
    ouOption: string;
    yearOption: string;
};

export async function approveMalDataValues(options: ApprovalOptions): Promise<void> {
    const { baseUrl, authString, ouOption, yearOption } = options;
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const approvalRepository = new MalDataApprovalDefaultRepository(api);
    const dataValueRepository = new DataValuesD2Repository(api);
    const dataSetRepository = new DataSetD2Repository(api);

    const { dataSet, orgUnit } = await getMalWMRMetadata(api, ouOption);
    const malDataApprovalItems = await buildMalApprovalItems(
        dataValueRepository,
        dataSetRepository,
        dataSet.id,
        orgUnit.id,
        yearOption
    );

    if (malDataApprovalItems.length === 0) {
        console.debug(`No data values to approve in ${dataSet.name} dataset.`);
        return;
    }

    const approveDataValuesUseCase = new ApproveMalDataValuesUseCase(dataSetRepository, approvalRepository);
    await approveDataValuesUseCase
        .execute(malDataApprovalItems)
        .catch(err => {
            console.error("Error approving data values:", err);
        })
        .then(stats => {
            const fileNameStats = "mal-data-approval-stats.json";
            writeFileSync(fileNameStats, JSON.stringify(stats, null, 2));
            console.debug(`Finished. Stats saved to ${fileNameStats}`);
        });
}

async function getMalWMRMetadata(api: D2Api, ouOption: string): Promise<{ dataSet: CodedRef; orgUnit: CodedRef }> {
    const [dataSet, orgUnit] = await Promise.all([
        getMetadataByIdentifiableToken({
            api: api,
            metadataType: "dataSets",
            token: MAL_WMR_FORM_CODE,
        }),
        getMetadataByIdentifiableToken({
            api: api,
            metadataType: "organisationUnits",
            token: ouOption ?? GLOBAL_OU,
        }),
    ]);

    return { dataSet, orgUnit };
}

async function buildMalApprovalItems(
    dataValueRepository: DataValuesD2Repository,
    dataSetRepository: DataSetD2Repository,
    dataSetId: Id,
    orgUnitId: Id,
    yearOption?: string
): Promise<DataDiffItemIdentifier[]> {
    const appSettings = await new AppSettingsD2Repository().get();
    const periods = yearOption
        ? [yearOption]
        : _.range(DEFAULT_START_YEAR, DEFAULT_END_YEAR + 1).map(year => year.toString());
    const dataValuesToApprove = await promiseMap(periods, async period => {
        console.debug(`Fetching dataValues for period ${period}...`);
        const dataElementsWithValues = await new WmrDiffReport(
            dataValueRepository,
            dataSetRepository,
            appSettings
        ).getDiff(
            dataSetId,
            orgUnitId,
            period,
            true // Include children
        );

        return dataElementsWithValues.map(dataElementWithValues => ({
            dataSet: dataElementWithValues.dataSetUid,
            orgUnit: dataElementWithValues.orgUnitUid,
            period: dataElementWithValues.period,
            dataElement: dataElementWithValues.dataElement ?? "",
            value: dataElementWithValues.value ?? "",
            apvdValue: dataElementWithValues.apvdValue ?? "",
            comment: dataElementWithValues.comment,
            attributeOptionCombo: dataElementWithValues.attributeOptionCombo,
            categoryOptionCombo: dataElementWithValues.categoryOptionCombo,
            dataElementBasicName: dataElementWithValues.dataElementBasicName,
        }));
    });

    return _(dataValuesToApprove).flatten().value();
}

async function main() {
    const parser = new ArgumentParser({
        description: `Approve data values in MAL WMR Form`,
    });

    parser.add_argument("-u", "--user-auth", {
        help: "DHIS2 authentication",
        metavar: "USERNAME:PASSWORD",
        default: process.env.REACT_APP_DHIS2_AUTH,
    });

    parser.add_argument("--url", {
        help: "DHIS2 base URL",
        metavar: "URL",
        default: process.env.REACT_APP_DHIS2_BASE_URL,
    });

    parser.add_argument("-ou", "--org-unit", {
        help: "Organisation unit identifier",
        metavar: "ORG_UNIT",
        default: GLOBAL_OU,
    });

    parser.add_argument("-y", "--year", {
        help: "Year to approve data values for",
        metavar: "YEAR",
    });

    try {
        const args = parser.parse_args();
        await approveMalDataValues({
            baseUrl: args.url,
            authString: args.user_auth,
            ouOption: args.org_unit,
            yearOption: args.year,
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
