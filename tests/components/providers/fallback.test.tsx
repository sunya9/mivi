import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { expect, test, vi } from "vitest";

import { Fallback } from "@/components/providers/fallback";
import { AppContext, createAppContext } from "@/contexts/app-context";
import * as utils from "@/lib/utils";

vi.spyOn(utils, "resetConfig");

const appContextValue = createAppContext(new AudioContext());

function renderFallback(resetErrorBoundary = () => {}) {
  render(
    <AppContext value={appContextValue}>
      <Fallback error={new Error("Test error message")} resetErrorBoundary={resetErrorBoundary} />
    </AppContext>,
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
  expect(utils.resetConfig).toHaveBeenCalledExactlyOnceWith(appContextValue.fileStore);
});

test("calls resetErrorBoundary when Reload app button is clicked", async () => {
  const resetErrorBoundary = vi.fn<() => void>();
  renderFallback(resetErrorBoundary);
  await userEvent.click(screen.getByText("Reload app"));
  expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
});
