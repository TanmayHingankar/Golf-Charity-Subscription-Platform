import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/auth/login/page";

describe("Auth forms", () => {
  it("renders login and allows typing", async () => {
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText(/Email/), "user@test.com");
    await userEvent.type(screen.getByPlaceholderText(/Password/), "pass1234");
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});
