type BasicAuth = { username: string; password: string };
type PatAuth = { type: "personalToken"; token: string };
type D2ApiAuth = BasicAuth | PatAuth;

// Resolves the DHIS2 credentials a CLI script should use. Prefers a Personal
// Access Token (REACT_APP_DHIS2_PAT) when set, which is the option that works
// on instances where the user has 2FA enabled — PATs bypass 2FA on the API.
// Falls back to REACT_APP_DHIS2_AUTH in the historical "username:password"
// format when no PAT is provided.
export function resolveD2ApiAuth(): D2ApiAuth {
    const pat = process.env.REACT_APP_DHIS2_PAT;
    if (pat) return { type: "personalToken", token: pat };

    const authString = process.env.REACT_APP_DHIS2_AUTH || "";
    const [username, password] = authString.split(":", 2);
    if (!username || !password) {
        throw new Error(
            "Invalid DHIS2 authentication. Set REACT_APP_DHIS2_PAT to a Personal Access Token, " +
                "or REACT_APP_DHIS2_AUTH to 'username:password'."
        );
    }

    return { username, password };
}
