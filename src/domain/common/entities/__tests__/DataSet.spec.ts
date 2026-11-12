import { getDataSetIdsForPeriodType, getDistinctPeriodTypes } from "../DataSet";

const dataSets = [
    { id: "m1", periodType: "Yearly" as const },
    { id: "m2", periodType: "Yearly" as const },
    { id: "mal", periodType: "Monthly" as const },
    { id: "m3", periodType: "Yearly" as const },
    { id: "noType", periodType: undefined },
];

describe("getDistinctPeriodTypes", () => {
    it("lists each period type once, in order of first use", () => {
        expect(getDistinctPeriodTypes(dataSets)).toEqual(["Yearly", "Monthly"]);
    });

    it("returns a single entry when every data set shares the period type", () => {
        expect(getDistinctPeriodTypes(dataSets.filter(ds => ds.periodType === "Yearly"))).toEqual(["Yearly"]);
    });

    it("returns nothing for no data sets", () => {
        expect(getDistinctPeriodTypes([])).toEqual([]);
    });
});

describe("getDataSetIdsForPeriodType", () => {
    it("keeps only the data sets of the given period type", () => {
        expect(getDataSetIdsForPeriodType(dataSets, "Yearly")).toEqual(["m1", "m2", "m3"]);
        expect(getDataSetIdsForPeriodType(dataSets, "Monthly")).toEqual(["mal"]);
    });
});
