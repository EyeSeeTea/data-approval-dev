## Introduction

Data Approval App

## Initial setup

```
$ yarn install
```

## Development

Start the development server at `http://localhost:8082` using `https://play.dhis2.org/2.34` as a backend:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/2.34" yarn start
```

## Generate sql view for a dataSet

Script to generate necessary sqlViews for dataSets and create a DataSetConfiguration.

If you want to persist the sqlViews and configuration to DHIS2 please configure the following variables in your `.env` file:

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

## Generate DataSet Approval metadata

Script to clone an existing DataSet and its DataElements with the `-APVD` suffix, generating a new approval DataSet and metadata file.

Make sure the following variables are configured in your `.env` file:

```
REACT_APP_DHIS2_BASE_URL=http://localhost:8080
REACT_APP_DHIS2_AUTH='admin:district'
```

Run the script:

```shell
yarn run generate-dataset-approval --dataSet MY_DS_CODE \
--dataElement-submission "MY_DS_CODE-Submission date module1-APVD" \
--dataElement-approval "MY_DS_CODE-Approval date module1-APVD" \
--persist
```

Parameters:

-   `--dataSet` (`-ds`): dataSet code of the original dataSet (required)
-   `--post`: commit metadata to DHIS2 (default: validate only)

Notes:

-   Writes a metadata JSON file named `<dataSetCode>_<timestamp>.json` in the current directory.
-   Show dataElements without code and saves them to `warning_<dataSetCode>_<timestamp>.json`.
-   On validation/import errors, saves details to `errors_<dataSetCode>_<timestamp>.json`.
