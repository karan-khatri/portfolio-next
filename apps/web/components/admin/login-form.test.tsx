import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { LoginForm } from "./login-form";
import { loginAction } from "@/app/admin/login/actions";

vi.mock("@/app/admin/login/actions", () => ({
  loginAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error toast when credentials are invalid", async () => {
    vi.mocked(loginAction).mockResolvedValue({ error: "Invalid credentials" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "wrong@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Invalid credentials"));
    expect(loginAction).toHaveBeenCalledWith("wrong@example.com", "wrong-password");
  });

  it("disables the submit button while the request is pending", async () => {
    let resolveLogin!: (value: { error?: string }) => void;
    vi.mocked(loginAction).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled());

    resolveLogin({});
  });

  it("does not show an error toast on success", async () => {
    vi.mocked(loginAction).mockResolvedValue({});
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(loginAction).toHaveBeenCalled());
    expect(toast.error).not.toHaveBeenCalled();
  });
});
