import { clearSession, readSession, saveSession } from "./session";

describe("auth session storage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("writes and reads a single session object", () => {
        const session = {
            token: "token-123",
            userId: "user-1",
            roles: ["Doctor"],
            expiresOn: "2099-01-01T00:00:00Z",
        };

        localStorage.setItem("token", "legacy-token");
        saveSession(session);

        expect(localStorage.getItem("token")).toBeNull();

        expect(JSON.parse(localStorage.getItem("nexus_auth_session"))).toEqual(
            session
        );
        expect(readSession()).toEqual(session);
    });

    it("clears the stored session and legacy keys", () => {
        saveSession({
            token: "token-123",
            userId: "user-1",
            roles: ["Doctor"],
            expiresOn: "2099-01-01T00:00:00Z",
        });
        localStorage.setItem("token", "legacy-token");

        clearSession();

        expect(localStorage.getItem("nexus_auth_session")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
        expect(readSession()).toEqual({
            token: null,
            userId: null,
            roles: [],
            expiresOn: null,
        });
    });

    it("returns an empty session for malformed storage", () => {
        localStorage.setItem("nexus_auth_session", "{not-json");

        expect(readSession()).toEqual({
            token: null,
            userId: null,
            roles: [],
            expiresOn: null,
        });
    });
});
