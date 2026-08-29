import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FooterPanel } from "@/components/app/footer-panel";
import { PwaContext, PwaState } from "@/contexts/pwa-context";
import { createMockPwaState } from "../../pwa-mock";
import { ComponentProps } from "react";

type Props = ComponentProps<typeof FooterPanel>;

function renderFooter(pwaState?: Partial<PwaState>) {
  const onOpenSettings = vi.fn<NonNullable<Props["onOpenSettings"]>>();
  render(
    <PwaContext value={createMockPwaState(pwaState)}>
      <FooterPanel onOpenSettings={onOpenSettings} />
    </PwaContext>,
  );
  return { onOpenSettings };
}

test("FooterPanel renders footer element", () => {
  renderFooter();

  expect(document.querySelector("footer")).toBeInTheDocument();
});

test("FooterPanel does not show Update badge when needRefresh is false", () => {
  renderFooter({ needRefresh: [false, vi.fn<PwaState["needRefresh"][1]>()] });

  expect(screen.queryByText("Update available")).not.toBeInTheDocument();
});

test("FooterPanel shows Update badge when needRefresh is true", () => {
  renderFooter({ needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()] });

  expect(screen.getByText("Update available")).toBeInTheDocument();
});

test("FooterPanel calls updateServiceWorker when Update badge is clicked", async () => {
  const user = userEvent.setup();
  const updateServiceWorker = vi.fn<PwaState["updateServiceWorker"]>();

  renderFooter({
    needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()],
    updateServiceWorker,
  });

  const updateBadge = document.querySelector('[data-slot="badge"]');
  expect(updateBadge).toBeInTheDocument();
  await user.click(updateBadge as Element);

  expect(updateServiceWorker).toHaveBeenCalled();
});

test("FooterPanel does not show Install button when canInstall is false", () => {
  renderFooter({ canInstall: false });

  expect(screen.queryByText("Install app")).not.toBeInTheDocument();
});

test("FooterPanel shows Install button when canInstall is true", () => {
  renderFooter({ canInstall: true });

  expect(screen.getByText("Install app")).toBeInTheDocument();
});

test("FooterPanel calls installPwa when Install button is clicked", async () => {
  const user = userEvent.setup();
  const installPwa = vi.fn<PwaState["installPwa"]>();

  renderFooter({ canInstall: true, installPwa });

  const installButton = screen.getByRole("button", { name: /install app/i });
  await user.click(installButton);

  expect(installPwa).toHaveBeenCalled();
});

test("FooterPanel shows both buttons when needRefresh and canInstall are true", () => {
  renderFooter({
    needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()],
    canInstall: true,
  });

  expect(screen.getByText("Update available")).toBeInTheDocument();
  expect(screen.getByText("Install app")).toBeInTheDocument();
});

test("FooterPanel shows neither button when both are false", () => {
  renderFooter({
    needRefresh: [false, vi.fn<PwaState["needRefresh"][1]>()],
    canInstall: false,
  });

  expect(screen.queryByText("Update available")).not.toBeInTheDocument();
  expect(screen.queryByText("Install app")).not.toBeInTheDocument();
});

test("FooterPanel renders Settings button", () => {
  renderFooter();

  expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
});

test("FooterPanel calls onOpenSettings when Settings button is clicked", async () => {
  const user = userEvent.setup();
  const { onOpenSettings } = renderFooter();

  const settingsButton = screen.getByRole("button", { name: /settings/i });
  await user.click(settingsButton);

  expect(onOpenSettings).toHaveBeenCalled();
});
