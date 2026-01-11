import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fallback } from "@/components/providers/fallback";
import * as utils from "@/lib/utils";

vi.spyOn(utils, "resetConfig");

function renderFallback() {
  render(
    <Fallback
      error={new Error("Test error message")}
      resetErrorBoundary={() => {}}
    />,
  );
}

test("renders error message", () => {
  renderFallback();
  expect(screen.getByText("Error")).toBeInTheDocument();
  expect(screen.getByText("Test error message")).toBeInTheDocument();
  expect(screen.getByText("Reset configuration")).toBeInTheDocument();
});

test("calls resetConfig when reset button is clicked", async () => {
  renderFallback();
  await userEvent.click(screen.getByText("Reset configuration"));
  expect(utils.resetConfig).toHaveBeenCalledTimes(1);
});

test("calls resetErrorBoundary when Reload app button is clicked", async () => {
  const resetErrorBoundary = vi.fn();
  render(
    <Fallback
      error={new Error("Test error")}
      resetErrorBoundary={resetErrorBoundary}
    />,
  );
  await userEvent.click(screen.getByText("Reload app"));
  expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
});
