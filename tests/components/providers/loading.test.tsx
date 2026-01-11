import { expect, test, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Loading } from "@/components/providers/loading";
import * as utils from "@/lib/utils";
import userEvent from "@testing-library/user-event";

vi.spyOn(utils, "resetConfig");

test("renders loading spinner and message", async () => {
  vi.useFakeTimers();
  render(<Loading />);

  expect(screen.getByText("Loading...")).toBeVisible();
  expect(screen.queryByRole("button")).toBeNull();

  await act(() => vi.advanceTimersByTimeAsync(3000));

  const resetButton = screen.getByRole("button");
  expect(resetButton).not.toHaveClass("invisible");
  expect(
    screen.getByText(/If nothing appears after a few seconds/),
  ).toBeVisible();
  vi.useRealTimers();

  await userEvent.click(resetButton);
  expect(utils.resetConfig).toHaveBeenCalledOnce();
});
