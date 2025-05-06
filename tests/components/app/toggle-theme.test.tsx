import { expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { ToggleTheme } from "@/components/app/toggle-theme";
import userEvent from "@testing-library/user-event";
import { customRender } from "tests/util";

test("renders theme toggle button with correct state", () => {
  customRender(<ToggleTheme />);

  const button = screen.getByRole("button");
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("Switch theme to dark")).toBeInTheDocument();
});

test("calls setTheme when button is clicked", async () => {
  customRender(<ToggleTheme />);

  const button = screen.getByRole("button");
  await userEvent.click(button);

  expect(button).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("Switch theme to light")).toBeInTheDocument();
});
