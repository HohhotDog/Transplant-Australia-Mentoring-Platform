import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForm from "../LoginForm";
import { BrowserRouter } from "react-router-dom";

// Mock NavBar to avoid rendering dependencies
jest.mock("../../Navigation/NavBar", () => () => <div data-testid="mock-navbar">Mock NavBar</div>);

// Mock fetch globally
global.fetch = jest.fn();

describe("LoginForm Component", () => {
    const mockOnLoginSuccess = jest.fn();
    const mockHandleLogout = jest.fn();

    const renderComponent = () =>
        render(
            <BrowserRouter>
                <LoginForm onLoginSuccess={mockOnLoginSuccess} isLoggedIn={false} handleLogout={mockHandleLogout} />
            </BrowserRouter>
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders login form fields and labels", () => {
        renderComponent();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText("Sign in")).toBeInTheDocument();
        expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    });

    test("submits form and calls onLoginSuccess on success", async () => {
        fetch.mockResolvedValueOnce({
            json: async () => ({ success: true }),
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: "__tests__@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "securepassword" },
        });

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith("/api/login", expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "__tests__@example.com",
                    password: "securepassword",
                }),
            }));
            expect(mockOnLoginSuccess).toHaveBeenCalled();
        });
    });

    test("shows alert on failed login attempt", async () => {
        window.alert = jest.fn(); // mock alert

        fetch.mockResolvedValueOnce({
            json: async () => ({ success: false, message: "Invalid credentials" }),
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: "wrong@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "wrongpassword" },
        });

        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Error: Invalid credentials");
        });
    });
});
