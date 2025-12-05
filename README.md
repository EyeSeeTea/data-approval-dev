## Introduction

_d2-reports_ than can be used as an standalone DHIS2 webapp or an standard HTML report (App: Reports). DHIS2 versions tested: 2.34.

## Reports

### NHWA Comments

This report shows data values for data sets `NHWA Module ...`. There are two kinds of data values displayed in the report table:

1. Data values that have comments.
2. Data values related pairs (value/comment), which are rendered as a single row. The pairing criteria is:

    - Comment data element `NHWA_Comment of Abc`.
    - Value data element: `NHWA_Abc`.

The API endpoint `/dataValueSets` does not provide all the features we need, so we use a custom SQL View instead.

## Initial setup

```
$ yarn install
```

## Development

Start the development server at `http://localhost:8082` using `https://play.dhis2.org/2.34` as a backend:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/2.34" yarn start
```

## Deploy

Create an standard report:

```
$ yarn build-report # Creates dist/index.html
$ yarn build-<key>-metadata -u 'user:pass' --url http://dhis2-server.org # Creates dist/metadata.json (key is a particular report group, e.g. nhwa)
$ yarn post-<key>-metadata -u 'user:pass' --url http://dhis2-server.org # Posts dist/metadata.json (key is a particular report group, e.g. nhwa)
```

Create an standalone DHIS2 webapp app:

```
$ yarn build-webapp # Creates dist/d2-reports.zip
```
