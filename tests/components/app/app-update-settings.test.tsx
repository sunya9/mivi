import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMockPwaState } from "tests/pwa-mock";
import { expect, test, vi } from "vitest";

import { AppUpdateSettings } from "@/components/app/app-update-settings";
import { PwaContext, PwaState } from "@/contexts/pwa-context";

function renderSettings(pwaState?: Partial<PwaState>) {
  return render(
    <PwaContext value={createMockPwaState(pwaState)}>
      <AppUpdateSettings />
    </PwaContext>,
  );
}

test("AppUpdateSettings renders nothing when no update is waiting", () => {
  const { container } = renderSettings();

  expect(container).toBeEmptyDOMElement();
});

test("AppUpdateSettings offers Update now when a new version is waiting", () => {
  renderSettings({ needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()] });

  expect(screen.getByRole("button", { name: "Update now" })).toBeVisible();
  expect(screen.getByText("A new version is available.")).toBeVisible();
});

test("AppUpdateSettings calls updateServiceWorker when Update now is clicked", async () => {
  const user = userEvent.setup();
  const updateServiceWorker = vi.fn<PwaState["updateServiceWorker"]>();
  renderSettings({
    needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()],
    updateServiceWorker,
  });

  await user.click(screen.getByRole("button", { name: "Update now" }));

  expect(updateServiceWorker).toHaveBeenCalledOnce();
});
