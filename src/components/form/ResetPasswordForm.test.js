import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { resetPassword } from "../../api/auth.api";

jest.mock("../../api/auth.api", () => ({
    resetPassword: jest.fn(),
}));

jest.mock("../../api/client", () => ({
    getApiErrorMessage: (error, fallback) => error?.detail || fallback,
}));

const renderForm = (search = "?email=doctor%40example.com&token=reset-token") =>
    render(
        <MemoryRouter
            initialEntries={[`/forgetpassword/resetpassword${search}`]}
        >
            <ResetPasswordForm />
        </MemoryRouter>
    );

const fillPasswords = (password, confirmation = password) => {
    fireEvent.change(screen.getByLabelText(/^new password$/i), {
        target: { value: password },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: confirmation },
    });
};

describe("ResetPasswordForm", () => {
    beforeEach(() => {
        resetPassword.mockReset();
    });

    it("shows an invalid-link message when the email or token is missing", () => {
        renderForm("?email=doctor%40example.com");

        expect(
            screen.getByRole("heading", { name: /this reset link is incomplete/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByLabelText(/^new password$/i)
        ).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: /back to sign in/i })).toHaveAttribute(
            "href",
            "/login"
        );
    });

    it("validates password length before calling the API", async () => {
        renderForm();
        fillPasswords("short");

        fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

        expect(
            screen.getByText(/between 8 and 128 characters/i)
        ).toBeInTheDocument();
        expect(resetPassword).not.toHaveBeenCalled();
    });

    it("rejects mismatched passwords before calling the API", () => {
        renderForm();
        fillPasswords("Password1!", "Password2!");

        fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        expect(resetPassword).not.toHaveBeenCalled();
    });

    it("submits the email, token, and new password to the API", async () => {
        resetPassword.mockResolvedValue("Your password has been reset successfully");
        renderForm();
        fillPasswords("Password1!");

        fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

        await waitFor(() =>
            expect(resetPassword).toHaveBeenCalledWith({
                email: "doctor@example.com",
                token: "reset-token",
                newPassword: "Password1!",
            })
        );
        expect(await screen.findByRole("status")).toHaveTextContent(
            /password updated/i
        );
    });

    it("shows the API error without claiming success", async () => {
        resetPassword.mockRejectedValue({ detail: "Invalid or expired token" });
        renderForm();
        fillPasswords("Password1!");

        fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Invalid or expired token"
        );
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});
