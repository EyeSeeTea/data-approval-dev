import { getApiReturning } from "../../__tests__/mockApi";
import { Dhis2ConfigRepository } from "../Dhis2ConfigRepository";

import superuserMe from "../../__tests__/data/superuserMe.json";
import superuserMeWithRolesOnlyInCredentials from "../../__tests__/data/superuserMeWithRolesOnlyInCredentials.json";
import nonSuperuserMe from "../../__tests__/data/nonSuperuserMe.json";

const getCurrentUser = (me: unknown) => new Dhis2ConfigRepository(getApiReturning({ "/me": me })).getCurrentUser();

describe("Dhis2ConfigRepository", () => {
    describe("getCurrentUser", () => {
        it("maps the user fields from the top level of the response", async () => {
            expect(await getCurrentUser(superuserMe)).toEqual({
                id: superuserMe.id,
                name: superuserMe.displayName,
                orgUnits: [],
                userGroups: superuserMe.userGroups,
                username: superuserMe.username,
                userRoles: superuserMe.userRoles,
                isAdmin: true,
            });
        });

        it("detects the admin from authorities when userRoles is empty and the roles are only in userCredentials", async () => {
            expect((await getCurrentUser(superuserMeWithRolesOnlyInCredentials)).isAdmin).toBe(true);
        });

        it("does not mark a user without the ALL authority as admin", async () => {
            expect((await getCurrentUser(nonSuperuserMe)).isAdmin).toBe(false);
        });
    });
});
