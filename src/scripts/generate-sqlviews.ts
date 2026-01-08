import "dotenv-flow/config";
import fs from "fs";
import { D2Api, Id } from "../types/d2-api";
import { ArgumentParser } from "argparse";
import _ from "lodash";
import { getUidFromSeed } from "../utils/uid";

const persistOptions = ["disk", "dhis"] as const;
type PersistOption = typeof persistOptions[number];

async function main() {
    const parser = new ArgumentParser({
        description: `Approve data values in MAL WMR Form`,
    });

    parser.add_argument("-ds", "--dataSet", {
        help: "DataSet code",
        metavar: "dataSet",
    });

    parser.add_argument("-de-sub", "--dataElement-submission", {
        help: "DataElement Submission Date Code",
        metavar: "deSubmissionCode",
    });

    parser.add_argument("-de-apprv", "--dataElement-approval", {
        help: "DataElement Approval Date Code",
        metavar: "deApprovalCode",
    });

    parser.add_argument("-persist", "--persist", {
        help: 'Save sqlViews to "disk" or "dhis"',
        metavar: "persist",
    });

    try {
        const args = parser.parse_args();
        const baseUrl = process.env.REACT_APP_DHIS2_BASE_URL || "";
        const authString = process.env.REACT_APP_DHIS2_AUTH || "";

        const [username, password] = authString.split(":", 2);
        if (!username || !password) throw new Error("Invalid DHIS2 authentication");

        const persistOption = persistOptions.find(po => po === args.persist);
        if (!persistOption)
            throw new Error(
                `Invalid persist option: '${args.persist}'. Valid options are: ${persistOptions.join(", ")}`
            );

        const api = new D2Api({ baseUrl, auth: { username, password } });

        await generateSqlViews({
            api,
            dataSetCode: args.dataSet,
            deSubmissionCode: args.dataElement_submission,
            deApprovalCode: args.dataElement_approval,
            persistOption,
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function getDataSetByCode(api: D2Api, code: string): Promise<DataSetInfo> {
    const response = await api.models.dataSets
        .get({
            fields: { id: true, code: true, periodType: true },
            filter: { code: { eq: code } },
            paging: false,
        })
        .getData();

    const d2DataSet = response.objects[0];
    if (!d2DataSet) {
        throw new Error(`DataSet with code '${code}' not found`);
    }

    const currentPeriodType = periodTypes.find(pt => pt === d2DataSet.periodType);
    if (!currentPeriodType) throw new Error(`Unsupported DataSet period type: '${d2DataSet.periodType}'`);

    return { code: d2DataSet.code, id: d2DataSet.id, periodType: currentPeriodType };
}

async function getDataElementsByCodes(
    api: D2Api,
    codes: string[]
): Promise<{ deSubmissionName: string; deApprovalName: string }> {
    const response = await api.models.dataElements
        .get({
            fields: { id: true, code: true, name: true },
            filter: { code: { in: codes } },
            paging: false,
        })
        .getData();

    const submissionDe = response.objects.find(de => de.code === codes[0]);
    const approvalDe = response.objects.find(de => de.code === codes[1]);

    if (!submissionDe) {
        throw new Error(`DataElement with code '${codes[0]}' not found`);
    }
    if (!approvalDe) {
        throw new Error(`DataElement with code '${codes[1]}' not found`);
    }

    return { deSubmissionName: submissionDe.name, deApprovalName: approvalDe.name };
}

async function generateSqlViews(args: {
    api: D2Api;
    dataSetCode: string;
    deSubmissionCode: string;
    deApprovalCode: string;
    persistOption: PersistOption;
}): Promise<void> {
    const { api, dataSetCode, deSubmissionCode, deApprovalCode } = args;
    const dataSet = await getDataSetByCode(api, dataSetCode);
    const { deApprovalName, deSubmissionName } = await getDataElementsByCodes(api, [deSubmissionCode, deApprovalCode]);
    const sqlViewData = generateSqlView({ dataSet, deApprovalName, deSubmissionName });

    if (args.persistOption === "disk") {
        fs.writeFileSync(`${sqlViewData.sqlDataSource.name}.sql`, sqlViewData.sqlDataSource.sqlQuery);
        fs.writeFileSync(`${sqlViewData.sqlDataSourceOld.name}_old.sql`, sqlViewData.sqlDataSourceOld.sqlQuery);
        fs.writeFileSync(`${sqlViewData.sqlViewDataValues.name}.sql`, sqlViewData.sqlViewDataValues.sqlQuery);
        fs.writeFileSync(`${sqlViewData.sqlViewDataValuesOld.name}_old.sql`, sqlViewData.sqlViewDataValuesOld.sqlQuery);
        console.debug("SQL views saved to disk");
    } else if (args.persistOption === "dhis") {
        await saveSqlViews(api, sqlViewData);
    } else {
        throw new Error(`Unsupported persist option: ${args.persistOption}`);
    }
}

async function saveSqlViews(api: D2Api, sqlViewData: SqlTemplateViewInfo): Promise<void> {
    const sqlViews = [
        sqlViewData.sqlDataSource,
        sqlViewData.sqlDataSourceOld,
        sqlViewData.sqlViewDataValues,
        sqlViewData.sqlViewDataValuesOld,
    ];

    const sqlViewIds = sqlViews.map(sv => sv.id);

    const existingSqlViews = await api.models.sqlViews
        .get({ filter: { id: { in: sqlViewIds } }, paging: false, fields: { $owner: true } })
        .getData();

    const sqlViewsToSave = sqlViews.map(sqlView => {
        const d2SqlView = existingSqlViews.objects.find(d2SqlView => d2SqlView.id === sqlView.id);

        return {
            ...(d2SqlView || {}),
            id: sqlView.id,
            name: sqlView.name,
            sqlQuery: sqlView.sqlQuery,
            type: sqlView.type,
            cacheStrategy: "RESPECT_SYSTEM_SETTING" as const,
        };
    });

    const response = await api.metadata.post({ sqlViews: sqlViewsToSave }).getData();

    console.debug(`SQL Views saved to DHIS2. Response: ${JSON.stringify(response.stats)}`);
}

function generateSqlView(options: SqlTemplateOptions): SqlTemplateViewInfo {
    const { dataSet, deApprovalName, deSubmissionName } = options;

    const isYearly = dataSet.periodType === "Yearly";

    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g,
    };

    const dvSql = isYearly
        ? readSqlView("src/scripts/sql-templates/datavalues_yearly.sql")
        : readSqlView("src/scripts/sql-templates/datavalues_monthly.sql");

    const dvSqlOld = isYearly
        ? readSqlView("src/scripts/sql-templates/datavalues_yearly_old.sql")
        : readSqlView("src/scripts/sql-templates/datavalues_monthly.sql");

    const dvOldLodashTemplate = _.template(dvSqlOld);
    const dvLodashTemplate = _.template(dvSql);

    const dvViewName = dataSet.code.replaceAll("-", "_").replaceAll("_", "").replaceAll(" ", "_").toLowerCase();

    const dvVariables: TemplateVariables = {
        periodTypeColumn: dataSet.periodType === "Yearly" ? "yearly" : "monthly",
        periodTypeName: dataSet.periodType,
        submissionDataElementName: deSubmissionName,
        approvalDataElementName: deApprovalName,
        dataSetId: dataSet.id,
        viewTableName: `dv${dvViewName}`,
        months: "11",
        sqlViewName: `dv${dvViewName}`,
    };

    const dvVariablesOld: TemplateVariables = {
        periodTypeColumn: dataSet.periodType === "Yearly" ? "yearly" : "monthly",
        periodTypeName: dataSet.periodType,
        submissionDataElementName: deSubmissionName,
        approvalDataElementName: deApprovalName,
        dataSetId: dataSet.id,
        viewTableName: `dv${dvViewName}oldperiods`,
        months: "24",
        sqlViewName: `dv${dvViewName}oldperiods`,
    };

    const dvCompiled = dvLodashTemplate(dvVariables);
    const dvOldCompiled = dvOldLodashTemplate(dvVariablesOld);

    const dataSourceSql = readSqlView("src/scripts/sql-templates/datasource.sql");
    const dataSourceOldSql = readSqlView("src/scripts/sql-templates/datasource.sql");

    const dataSourceTemplate = _.template(dataSourceSql);
    const dataSourceOldTemplate = _.template(dataSourceOldSql);

    const dataSourceVariables = { ...dvVariables, sqlViewName: `${dataSet.code} Data Approval` };
    const dataSourceOldVariables = { ...dvVariablesOld, sqlViewName: `${dataSet.code} Data Approval Old Periods` };

    const dsCompiled = dataSourceTemplate(dataSourceVariables);
    const dsOldCompiled = dataSourceOldTemplate(dataSourceOldVariables);

    return {
        sqlViewDataValues: {
            id: getUidFromSeed(dvVariables.sqlViewName),
            sqlQuery: dvCompiled,
            name: dvVariables.sqlViewName,
            type: "MATERIALIZED_VIEW",
        },
        sqlViewDataValuesOld: {
            id: getUidFromSeed(dvVariablesOld.sqlViewName),
            sqlQuery: dvOldCompiled,
            name: dvVariablesOld.sqlViewName,
            type: "MATERIALIZED_VIEW",
        },
        sqlDataSource: {
            id: getUidFromSeed(dataSourceVariables.sqlViewName),
            sqlQuery: dsCompiled,
            name: dataSourceVariables.sqlViewName,
            type: "QUERY",
        },
        sqlDataSourceOld: {
            id: getUidFromSeed(dataSourceOldVariables.sqlViewName),
            sqlQuery: dsOldCompiled,
            name: dataSourceOldVariables.sqlViewName,
            type: "QUERY",
        },
    };
}

function readSqlView(path: string) {
    const sqlView = fs.readFileSync(path, "utf-8");
    return sqlView;
}

main();

type TemplateVariables = {
    periodTypeColumn: "yearly" | "monthly";
    periodTypeName: PeriodType;
    submissionDataElementName: string;
    approvalDataElementName: string;
    dataSetId: string;
    viewTableName: string;
    months: string;
    sqlViewName: string;
};

const periodTypes = ["Yearly", "Monthly"] as const;
type PeriodType = typeof periodTypes[number];
type DataSetInfo = { code: string; id: Id; periodType: "Yearly" | "Monthly" };

type SqlTemplateOptions = {
    dataSet: DataSetInfo;
    deApprovalName: string;
    deSubmissionName: string;
};

type SqlTemplateViewInfo = {
    sqlViewDataValues: D2SqlViewAttrs;
    sqlViewDataValuesOld: D2SqlViewAttrs;
    sqlDataSource: D2SqlViewAttrs;
    sqlDataSourceOld: D2SqlViewAttrs;
};

type D2SqlViewAttrs = {
    id: string;
    sqlQuery: string;
    name: string;
    type: "MATERIALIZED_VIEW" | "QUERY";
};
