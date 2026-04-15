# Data Approval Extended

**Data Approval Extended** (formerly *NHWA Approval Report*) is a DHIS2 app that lets authorised users review the state of dataset submissions across organisation units and periods, and drive them through a complete **complete → submit → approve** workflow backed by the native `dataApprovals` / `completeDataSetRegistrations` APIs and a mirror "approval" dataset (APVD) that stores per-element approved values and submission/approval timestamps.

The app is **generic**: any DHIS2 dataset can be registered from the in-app *DataSet Configurations* settings screen, pointed at its APVD dataset and SQL views, and given per-action permission groups. Configurations live in the DHIS2 dataStore (`dataset-approval` namespace) and can be edited at runtime without redeploying the app.

See the [user guide](docs/data-approval-user-guide.md) for the full end-user documentation — list columns, filters, the contextual row actions, per-dataset permission groups and the optional *DataElementGroups* flag.

## Requirements

-   Node.js and Yarn (Classic).
-   A DHIS2 instance compatible with `react-scripts@4` / `@dhis2/app-runtime@3.2.5`.
-   Credentials for a DHIS2 user with enough privileges to create metadata (datasets, data elements, SQL views, dataStore entries) when running the setup scripts below.

## Initial setup

```
$ yarn install
```

Most tasks in this repo — the dev server, the build, and the setup scripts — read DHIS2 credentials from environment variables. Create a `.env.local` file at the repo root:

```
REACT_APP_DHIS2_BASE_URL=http://localhost:8080
REACT_APP_DHIS2_AUTH=admin:district
```

## Development

Start the development server at `http://localhost:8082` using `https://play.dhis2.org/2.34` as a backend:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/2.34" yarn start
```

## Building the app

```
$ yarn build
```

Produces an installable app zip (`data-approval-extended.zip`) at the repo root. Drop it into **App Management** on any compatible DHIS2 instance to install or upgrade the app. `yarn build` runs `yarn localize` and `yarn test` via the `prebuild` hook before building, so a failing test will abort the build.

## End-to-end dataset setup

Before a dataset shows up in the app, three pieces of DHIS2 metadata must be in place:

1.  An **approval (APVD) dataset** — a clone of the source dataset whose data elements carry the `-APVD` suffix, plus two date data elements that track when the data was submitted and when it was approved.
2.  Two **SQL views** — one for current periods and one for old periods — that the app queries for the approval list.
3.  A **DataSetConfiguration** entry in the dataStore that glues the two together and sets the permission groups.

Steps 1 and 2 are automated by the setup scripts described below. Step 3 can be done either by the same `generate-sqlviews --persist dhis` invocation (which creates a default configuration) or by hand from the in-app **DataSet Configurations** settings screen.

Typical end-to-end flow for a fresh dataset:

1.  Populate `.env.local` with `REACT_APP_DHIS2_BASE_URL` and `REACT_APP_DHIS2_AUTH`.
2.  Run `yarn run generate-dataset-approval` **without** `--post` to preview the APVD dataset that would be created, then re-run **with** `--post` to commit it.
3.  Run `yarn run generate-sqlviews --persist dhis` to create the current-periods and old-periods SQL views in the instance (and a default `DataSetConfiguration`).
4.  Open the app → *DataSet Configurations* → edit the newly created entry, adjust the *Submit Date* / *Approval Date* data elements if needed, and assign user groups / users to each permission (*Read*, *Complete*, *Incomplete*, *Submit*, *Revoke*, *Approve*). Save.
5.  Open the main **Data Approval** list, apply filters and verify the rows for the new dataset appear with the expected statuses.

## Generate sql view for a dataSet

Script to generate necessary sqlViews for dataSets and create a DataSetConfiguration.

If you want to persist the sqlViews and configuration to DHIS2 please configure the following variables in your `.env.local` file:

```
REACT_APP_DHIS2_BASE_URL=http://localhost:8080
REACT_APP_DHIS2_AUTH='admin:district'
```

Run the script:

```shell
yarn run generate-sqlviews \
--dataSet MY_DS_CODE \
--dataSet-destination MY_DS_APPROVAL_CODE \
--dataElement-submission DATAELEMENT_CODE_SUBMISSION-APVD \
--dataElement-approval DATAELEMENT_CODE_APPROVAL_DATE-APVD \
--persist dhis
```

Parameters:

-   `--dataSet` (`-ds`): dataSet code of the original dataSet
-   `--dataSet-destination` (`-ds-dest`): dataSet code of the destination/approval dataSet (required)
-   `--dataElement-submission` (`-de-sub`): dataElement code where the submission date is going to be saved (this must be in the APPROVAL dataSet)
-   `--dataElement-approval` (`-de-apprv`): dataElement code where the approval date is going to be saved (this must be in the APPROVAL dataSet)
-   `--persist`: save sqlViews to `dhis` or `disk`

When `--persist dhis` is used, the script also creates a DataSetConfiguration in the DHIS2 DataStore with `submitAndComplete: true`, `revokeAndIncomplete: true`, and empty permissions (only admin users have access to this dataSet. You can edit this in the settings page of the application).

When `--persist disk` is used, the generated SQL is written to files under the repo so you can review or hand-apply it, and a `sqlviews-import-report.json` file is written with the details of what would be created.

## Generate DataSet Approval metadata

Script to clone an existing DataSet and its DataElements with the `-APVD` suffix, generating a new approval DataSet and metadata file.

Make sure the following variables are configured in your `.env.local` file:

```
REACT_APP_DHIS2_BASE_URL=http://localhost:8080
REACT_APP_DHIS2_AUTH='admin:district'
```

Run the script:

```shell
yarn run generate-dataset-approval --dataSet MY_DS_CODE \
--dataElement-submission "MY_DS_CODE-Submission date module1-APVD" \
--dataElement-approval "MY_DS_CODE-Approval date module1-APVD" \
--post
```

Parameters:

-   `--dataSet` (`-ds`): dataSet code of the original dataSet (required)
-   `--dataElement-submission`: name/code of the data element that will store the submission timestamp (required)
-   `--dataElement-approval`: name/code of the data element that will store the approval timestamp (required)
-   `--post`: commit metadata to DHIS2 (default: validate only)

Notes:

-   Without `--post` the script runs in **validate-only** (dry-run) mode, prints what it would create and exits without touching DHIS2 — so you can safely preview before committing.
-   Writes a metadata JSON file named `<dataSetCode>_<timestamp>.json` in the current directory.
-   Long names/codes are automatically trimmed to stay within DHIS2's length limits; the trimmed values are logged to `trimmed_names_<dataSetCode>_<timestamp>.json`.
-   DataElements without a code are reported in `warnings_dataelements_<dataSetCode>_<timestamp>.json`.
-   On validation/import errors, saves details to `errors_<dataSetCode>_<timestamp>.json`.

## Where configuration lives

-   **DataSet configurations** are stored in the DHIS2 dataStore under the `dataset-approval` namespace, one entry per dataset, with keys of the form `DS_<id>`. Creating, editing and removing configurations is done either through the in-app *DataSet Configurations* settings screen or, for the initial default entry, automatically by `yarn run generate-sqlviews --persist dhis`.
-   **Per-user column visibility** for the main Data Approval list is stored under the user dataStore namespace `nhwa-data-approval-status-user-columns`, so each user's gear-icon column layout is remembered across sessions.
-   **Approval state** for each (dataset, orgUnit, period) row is tracked through DHIS2's native `dataApprovals` and `completeDataSetRegistrations` APIs, with submission and approval dates written as data values on the configured date dataElements of the APVD dataset (default COC).

## Other scripts

-   `yarn lint` — ESLint over `src/`.
-   `yarn test` — Jest (with `--passWithNoTests`).
-   `yarn prettify` — Prettier over the repo.
-   `yarn localize` — extract POT + regenerate i18n strings.
-   `yarn approve-mal-datavalues` / `yarn check-data-differences` — legacy operator scripts kept around for ad-hoc DHIS2 interventions; see the script sources under `src/scripts/`.
