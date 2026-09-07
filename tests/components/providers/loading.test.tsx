import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { expect, test, vi } from "vitest";

import { Loading } from "@/components/providers/loading";
import { AppContext, createAppContext } from "@/contexts/app-context";
import * as utils from "@/lib/utils";

vi.spyOn(utils, "resetConfig");

test("renders loading spinner and message", async () => {
  vi.useFakeTimers();
  const appContextValue = createAppContext(new AudioContext());
  render(
    <AppContext value={appContextValue}>
      <Loading />
    </AppContext>,
  );

  expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  expect(screen.queryByRole("button")).toBeNull();

  await act(() => vi.advanceTimersByTimeAsync(3000));

  const resetButton = screen.getByRole("button");
  expect(resetButton).not.toHaveClass("invisible");
  expect(screen.getByText(/If nothing appears after a few seconds/)).toBeVisible();
  vi.useRealTimers();

  await userEvent.click(resetButton);
  expect(utils.resetConfig).toHaveBeenCalledExactlyOnceWith(appContextValue.fileStore);
});
