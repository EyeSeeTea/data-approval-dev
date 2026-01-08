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

Script to generate necessary sqlViews for dataSets

if you want to persist the sqlViews to DHIS2 please configure the following variables in your `.env` file:

```
REACT_APP_DHIS2_BASE_URL=http://localhost:8080
REACT_APP_DHIS2_AUTH='admin:district'
```

run the script

```shell
yarn run generate-sqlviews \
--dataSet MY_DS_CODE \
--dataElement-submission DATAELEMENT_CODE_SUBMISSION-APVD \
--dataElement-approval DATAELEMENT_CODE_APPROVAL_DATE-APVD \
--persist dhis
```

-   dataSet: dataSet code of the original dataSet
-   dataElement-submission: dataElement code where the submission date is going to be saved (this must be in the APPROVAL dataSet)
-   dataElement-approval: dataElement code where the approval date is going to be saved (this must be in the APPROVAL dataSet)
-   persist: save sqlViews to `dhis` or `disk`
