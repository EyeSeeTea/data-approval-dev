import { hasModifications, matchesModificationCountFilter, parseModificationCountFilter } from "../MalDataApprovalItem";

describe("matchesModificationCountFilter", () => {
    it("keeps only counted rows for 'some'", () => {
        expect(matchesModificationCountFilter("2", "some")).toBe(true);
        expect(matchesModificationCountFilter("", "some")).toBe(false);
        expect(matchesModificationCountFilter(undefined, "some")).toBe(false);
        expect(matchesModificationCountFilter("0", "some")).toBe(false);
    });

    it("keeps only uncounted rows for 'none'", () => {
        expect(matchesModificationCountFilter("", "none")).toBe(true);
        expect(matchesModificationCountFilter(undefined, "none")).toBe(true);
        expect(matchesModificationCountFilter("0", "none")).toBe(true);
        expect(matchesModificationCountFilter("2", "none")).toBe(false);
    });
});

describe("hasModifications", () => {
    it("reads the count the user sees in the Modification Count column", () => {
        expect(hasModifications("1")).toBe(true);
        expect(hasModifications("")).toBe(false);
        expect(hasModifications(undefined)).toBe(false);
    });
});

describe("parseModificationCountFilter", () => {
    it("accepts the dropdown values and rejects anything else", () => {
        expect(parseModificationCountFilter("none")).toBe("none");
        expect(parseModificationCountFilter("some")).toBe("some");
        expect(parseModificationCountFilter("1")).toBeUndefined();
        expect(parseModificationCountFilter(undefined)).toBeUndefined();
    });
});
