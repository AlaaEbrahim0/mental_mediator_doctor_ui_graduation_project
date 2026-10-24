import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AuthProvider, { useAuth } from "./authProvider";
import { saveSession } from "./session";

const Consumer = () => {
    const { token, signOut } = useAuth();

    return (
        <>
            <span>{token || "no-token"}</span>
            <button type="button" onClick={signOut}>
                Sign out
            </button>
        </>
    );
};

const renderProvider = () =>
    render(
        <AuthProvider>
            <Consumer />
        </AuthProvider>
    );

describe("AuthProvider", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("restores the persisted session on mount", () => {
        saveSession({
            token: "token-1",
            userId: "user-1",
            roles: ["Doctor"],
            expiresOn: new Date(Date.now() + 60_000).toISOString(),
        });

        renderProvider();

        expect(screen.getByText("token-1")).toBeInTheDocument();
    });

    it("clears both React state and storage on sign out", async () => {
        saveSession({
            token: "token-1",
            userId: "user-1",
            roles: ["Doctor"],
            expiresOn: new Date(Date.now() + 60_000).toISOString(),
        });
        renderProvider();

        fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

        await waitFor(() =>
            expect(screen.getByText("no-token")).toBeInTheDocument()
        );
        expect(localStorage.getItem("nexus_auth_session")).toBeNull();
    });

    it("drops an already-expired persisted session", async () => {
        saveSession({
            token: "expired-token",
            userId: "user-1",
            roles: ["Doctor"],
            expiresOn: new Date(Date.now() - 60_000).toISOString(),
        });

        renderProvider();

        await waitFor(() =>
            expect(screen.getByText("no-token")).toBeInTheDocument()
        );
        expect(localStorage.getItem("nexus_auth_session")).toBeNull();
    });
});
