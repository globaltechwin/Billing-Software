import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "./LoginForm";

// Mock fetch
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  Object.defineProperty(window, "location", {
    value: { href: "/" },
    writable: true,
  });
});

describe("LoginForm", () => {
  it("renders username and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/username/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
  });

  it("renders sign in button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
  });

  it("shows error when username is empty", async () => {
    render(<LoginForm />);
    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText("Username is required")).toBeTruthy();
  });

  it("shows error when password is empty", async () => {
    render(<LoginForm />);
    const usernameInput = screen.getByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: "admin" } });
    const submitBtn = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText("Password is required")).toBeTruthy();
  });

  it("calls login API on valid submission", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "password123" }),
      });
    });
  });

  it("displays error message from failed login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ success: false, message: "Invalid credentials" }),
      })
    );
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeTruthy();
  });

  it("shows features list", () => {
    render(<LoginForm />);
    expect(screen.getByText("Billing")).toBeTruthy();
    expect(screen.getByText("Inventory")).toBeTruthy();
    expect(screen.getByText("QR Ordering")).toBeTruthy();
  });
});
