import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthProvider from "../../auth/authProvider";
import { LoginForm } from "./LoginForm";
import { useForgetPassword, useSignIn } from "../../api/auth.api";

jest.mock("../../api/auth.api", () => ({
    useSignIn: jest.fn(),
    useForgetPassword: jest.fn(),
}));

const mockSignIn = jest.fn();

const renderLogin = () =>
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={["/login"]}>
                <LoginForm />
            </MemoryRouter>
        </AuthProvider>
    );

describe("LoginForm", () => {
    beforeEach(() => {
        localStorage.clear();
        mockSignIn.mockReset();
        useSignIn.mockReturnValue({
            isLoading: false,
            errorMessages: [],
            execute: mockSignIn,
        });
        useForgetPassword.mockReturnValue({ execute: jest.fn() });
    });

    it("stores the signed-in session through the shared session key only", async () => {
        mockSignIn.mockResolvedValue({
            token: "token-1",
            userId: "user-1",
            roles: ["Doctor"],
            expiresOn: new Date(Date.now() + 60_000).toISOString(),
        });

        renderLogin();

        fireEvent.change(screen.getByLabelText("Email"), {
            target: { value: "doctor@example.com" },
        });
        fireEvent.change(screen.getByLabelText("Password"), {
            target: { value: "Password1!" },
        });
        fireEvent.click(screen.getByRole("button", { name: /^login$/i }));

        await waitFor(() =>
            expect(JSON.parse(localStorage.getItem("nexus_auth_session"))).toMatchObject({
                token: "token-1",
                userId: "user-1",
                roles: ["Doctor"],
            })
        );

        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("userId")).toBeNull();
        expect(localStorage.getItem("roles")).toBeNull();
        expect(localStorage.getItem("expiresOn")).toBeNull();
    });
});
