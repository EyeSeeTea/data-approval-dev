import { User } from "../../domain/entities/User";
import { UserD2Repository } from "../UserD2Repository";
import { getApiReturning } from "./mockApi";

import superuserMe from "./data/superuserMe.json";
import superuserMeWithRolesOnlyInCredentials from "./data/superuserMeWithRolesOnlyInCredentials.json";
import nonSuperuserMe from "./data/nonSuperuserMe.json";

const getCurrent = (me: unknown) => new UserD2Repository(getApiReturning("/me", me)).getCurrent().toPromise();

describe("UserD2Repository", () => {
    describe("getCurrent", () => {
        it("maps the user fields from the top level of the response", async () => {
            expect(await getCurrent(superuserMe)).toEqual(
                new User({
                    id: superuserMe.id,
                    name: superuserMe.displayName,
                    username: superuserMe.username,
                    userRoles: superuserMe.userRoles,
                    userGroups: superuserMe.userGroups,
                    isSuperAdmin: true,
                })
            );
        });

        it("detects the superadmin from authorities when userRoles is empty and the roles are only in userCredentials", async () => {
            expect((await getCurrent(superuserMeWithRolesOnlyInCredentials)).isSuperAdmin).toBe(true);
        });

        it("does not mark a user without the ALL authority as superadmin", async () => {
            expect((await getCurrent(nonSuperuserMe)).isSuperAdmin).toBe(false);
        });
    });
});
