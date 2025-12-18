import { D2Api } from "../types/d2-api";
import { ArgumentParser } from "argparse";
import "dotenv-flow/config";
import { DataValuesD2Repository } from "../data/common/DataValuesD2Repository";
import { DataSetD2Repository } from "../data/common/DataSetD2Repository";
import { getMetadataByIdentifiableToken } from "../data/common/utils/getMetadataByIdentifiableToken";
import { CodedRef } from "../domain/common/entities/Ref";
import { Id } from "../domain/common/entities/Base";
import _ from "lodash";
import { promiseMap } from "../utils/promises";
import { WmrDiffReport } from "../domain/reports/WmrDiffReport";
import { UserD2Repository } from "../data/UserD2Repository";
import { DataSetConfigurationD2Repository } from "../data/DataSetConfigurationD2Repository";
import {
    DataSetWithConfigPermissions,
    GetApprovalConfigurationsUseCase,
} from "../domain/usecases/GetApprovalConfigurationsUseCase";
import { writeFileSync } from "fs";

const GLOBAL_OU = "WHO-HQ";
const DEFAULT_START_YEAR = 2001;
const DEFAULT_END_YEAR = 2025;

type DataDifferencesOptions = {
    baseUrl: string;
    authString: string;
    orgUnit?: string;
    year?: string;
    dataSetCode: string;
    dataSetApprovalName: string;
};

type DataDiffItem = {
    dataElement: string | undefined;
    orgUnit: string;
    period: string;
};

export async function checkMalDataValuesDiff(options: DataDifferencesOptions): Promise<void> {
    const { baseUrl, authString, orgUnit: ouOption, year: yearOption, dataSetCode, dataSetApprovalName } = options;
    if (!dataSetCode || !dataSetApprovalName) {
        throw new Error("dataSetCode and dataSetApprovalName are required parameters");
    }
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const dataValueRepository = new DataValuesD2Repository(api);
    const dataSetRepository = new DataSetD2Repository(api);

    const userRepository = new UserD2Repository(api);
    const dataSetConfigurationRepository = new DataSetConfigurationD2Repository(api);

    const getConfigUseCase = new GetApprovalConfigurationsUseCase({
        dataSetRepository,
        dataSetConfigurationRepository,
        userRepository,
    });

    const dataSetConfigs = await getConfigUseCase.execute().toPromise();

    const { dataSet, orgUnit } = await getMalWMRMetadata(api, dataSetCode, ouOption);
    console.debug(`dataSet original: ${dataSet.name} and orgUnit: ${orgUnit.name}`);

    const dataElementsWithValues = await buildDataDifferenceItems({
        dataValueRepository: dataValueRepository,
        dataSetRepository: dataSetRepository,
        dataSetId: dataSet.id,
        orgUnitId: orgUnit.id,
        dataSetConfigs,
        yearOption: yearOption,
        dataSetApprovalName: dataSetApprovalName,
    });

    if (dataElementsWithValues.length === 0) console.debug("No differences found");
    else {
        const formattedLog = formatDataDiffLog(dataElementsWithValues, dataSet.name, orgUnit.name, yearOption);
        console.debug(formattedLog);
        // save to disk including current_date at the beginning of the file name date and time
        const currentDateTime = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `${dataSet.code}-${currentDateTime}-data-differences-${orgUnit.code}.log`;
        writeFileSync(fileName, formattedLog);
        console.debug(`Differences log saved to ${fileName}`);
    }
}

async function buildDataDifferenceItems(options: {
    dataValueRepository: DataValuesD2Repository;
    dataSetRepository: DataSetD2Repository;
    dataSetId: Id;
    orgUnitId: Id;
    dataSetConfigs: DataSetWithConfigPermissions[];
    yearOption?: string;
    dataSetApprovalName: string;
}): Promise<DataDiffItem[]> {
    const {
        dataValueRepository,
        dataSetRepository,
        dataSetId,
        orgUnitId,
        yearOption,
        dataSetConfigs,
        dataSetApprovalName,
    } = options;
    const dataSetAPVD = await dataSetRepository.getByNameOrCode(dataSetApprovalName);

    // If not OU is provided, use the org. units assigned to the APVD data set
    const assignedOrgUnitIds = dataSetAPVD.organisationUnits.map(ou => ou.id);

    const periods = yearOption
        ? [yearOption]
        : _.range(DEFAULT_START_YEAR, DEFAULT_END_YEAR + 1).map(year => year.toString());

    const dataValuesToApprove = await promiseMap(periods, async period => {
        console.debug(`Fetching dataValues for period ${period}...`);
        const dataElementsWithValues = await new WmrDiffReport(
            dataValueRepository,
            dataSetRepository,
            dataSetConfigs
        ).getDiff(
            dataSetId,
            orgUnitId,
            period,
            true // Include children
        );

        return dataElementsWithValues
            .filter(dv => assignedOrgUnitIds.includes(dv.orgUnitUid))
            .map(dataElementWithValues => ({
                orgUnit: dataElementWithValues.orgUnitUid,
                period: dataElementWithValues.period,
                dataElement: dataElementWithValues.dataElement ?? "",
            }));
    });

    return _(dataValuesToApprove).flatten().value();
}

async function getMalWMRMetadata(
    api: D2Api,
    dataSetCode: string,
    ouOption?: string
): Promise<{ dataSet: CodedRef; orgUnit: CodedRef }> {
    const [dataSet, orgUnit] = await Promise.all([
        getMetadataByIdentifiableToken({
            api: api,
            metadataType: "dataSets",
            token: dataSetCode,
        }),
        getMetadataByIdentifiableToken({
            api: api,
            metadataType: "organisationUnits",
            token: ouOption ?? GLOBAL_OU,
        }),
    ]);

    return { dataSet, orgUnit };
}

async function main() {
    const parser = new ArgumentParser({
        description: `Check difference between MAL WMR apvd and unapvd data sets`,
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
        help: "Year to check differences for",
        metavar: "YEAR",
    });

    parser.add_argument("-ds", "--dataset", {
        help: "DataSet code",
        metavar: "dataset",
    });

    parser.add_argument("--dsa", "--dataset-approval", {
        help: "DataSet approval name",
        metavar: "dataSetApprovalName",
    });

    try {
        const args = parser.parse_args();
        await checkMalDataValuesDiff({
            baseUrl: args.url,
            authString: args.user_auth,
            orgUnit: args.org_unit,
            year: args.year,
            dataSetCode: args.dataset,
            dataSetApprovalName: args.dsa,
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

function formatDataDiffLog(
    dataDiffItems: DataDiffItem[],
    dataSetName: string,
    orgUnitName: string,
    yearOption?: string
): string {
    const logTitle = `${dataDiffItems.length} differences found in ${dataSetName} for ${
        yearOption ? `period ${yearOption}` : `periods ${DEFAULT_START_YEAR} to ${DEFAULT_END_YEAR}`
    } in ${orgUnitName} organisation unit: \n`;
    const dataDiffList = dataDiffItems
        .map(
            (item, index) =>
                `${index + 1}. Data element: ${item.dataElement}, Org Unit: ${item.orgUnit}, Period: ${item.period}`
        )
        .join("\n");

    return logTitle + dataDiffList;
}

main();
