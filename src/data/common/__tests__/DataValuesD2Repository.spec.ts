import { getApiReturning } from "../../__tests__/mockApi";
import { DataValuesD2Repository } from "../DataValuesD2Repository";

import dataValueSetWithSharedFieldsAtRoot from "./data/dataValueSetWithSharedFieldsAtRoot.json";
import dataValueSetWithFieldsInEachValue from "./data/dataValueSetWithFieldsInEachValue.json";
import dataElements from "./data/dataElements.json";

const getDataValues = (dataValueSet: unknown) =>
    new DataValuesD2Repository(getApiReturning({ "/dataValueSets": dataValueSet, "/dataElements": dataElements })).get({
        dataSetIds: ["dataSet0001"],
        orgUnitIds: ["orgUnit0001"],
        periods: ["202601"],
    });

const expectedDataValue = {
    dataElement: "dataElem001",
    dataElementName: "Test data element",
    period: "202601",
    orgUnit: "orgUnit0001",
    categoryOptionCombo: "coc00000001",
    attributeOptionCombo: "aoc00000001",
    value: "10",
    storedBy: "test.user",
    created: "2026-01-15T10:00:00.000",
    lastUpdated: "2026-01-15T10:00:00.000",
    followup: false,
};

describe("DataValuesD2Repository", () => {
    describe("get", () => {
        it("takes orgUnit, period and attributeOptionCombo from the root when the data values do not have them", async () => {
            expect(await getDataValues(dataValueSetWithSharedFieldsAtRoot)).toEqual([expectedDataValue]);
        });

        it("keeps orgUnit, period and attributeOptionCombo from each data value when it has them", async () => {
            expect(await getDataValues(dataValueSetWithFieldsInEachValue)).toEqual([
                { ...expectedDataValue, comment: "Test comment" },
            ]);
        });
    });
});
