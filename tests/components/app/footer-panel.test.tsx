import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FooterPanel } from "@/components/app/footer-panel";
import { PwaContext, PwaState } from "@/contexts/pwa-context";
import { createMockPwaState } from "../../pwa-mock";

function PwaWrapper({
  children,
  pwaState,
}: {
  children: React.ReactNode;
  pwaState?: Partial<PwaState>;
}) {
  return (
    <PwaContext value={createMockPwaState(pwaState)}>{children}</PwaContext>
  );
}

test("FooterPanel renders footer element", () => {
  render(
    <PwaWrapper>
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(document.querySelector("footer")).toBeInTheDocument();
});

test("FooterPanel does not show Update badge when needRefresh is false", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [false, vi.fn()] }}>
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.queryByText("Update available")).not.toBeInTheDocument();
});

test("FooterPanel shows Update badge when needRefresh is true", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [true, vi.fn()] }}>
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.getByText("Update available")).toBeInTheDocument();
});

test("FooterPanel calls updateServiceWorker when Update badge is clicked", async () => {
  const user = userEvent.setup();
  const updateServiceWorker = vi.fn();

  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [true, vi.fn()],
        updateServiceWorker,
      }}
    >
      <FooterPanel />
    </PwaWrapper>,
  );

  const updateBadge = document.querySelector('[data-slot="badge"]');
  expect(updateBadge).toBeInTheDocument();
  await user.click(updateBadge as Element);

  expect(updateServiceWorker).toHaveBeenCalled();
});

test("FooterPanel does not show Install button when canInstall is false", () => {
  render(
    <PwaWrapper pwaState={{ canInstall: false }}>
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.queryByText("Install app")).not.toBeInTheDocument();
});

test("FooterPanel shows Install button when canInstall is true", () => {
  render(
    <PwaWrapper pwaState={{ canInstall: true }}>
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.getByText("Install app")).toBeInTheDocument();
});

test("FooterPanel calls installPwa when Install button is clicked", async () => {
  const user = userEvent.setup();
  const installPwa = vi.fn();

  render(
    <PwaWrapper
      pwaState={{
        canInstall: true,
        installPwa,
      }}
    >
      <FooterPanel />
    </PwaWrapper>,
  );

  const installButton = screen.getByRole("button", { name: /install app/i });
  await user.click(installButton);

  expect(installPwa).toHaveBeenCalled();
});

test("FooterPanel shows both buttons when needRefresh and canInstall are true", () => {
  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [true, vi.fn()],
        canInstall: true,
      }}
    >
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.getByText("Update available")).toBeInTheDocument();
  expect(screen.getByText("Install app")).toBeInTheDocument();
});

test("FooterPanel shows neither button when both are false", () => {
  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [false, vi.fn()],
        canInstall: false,
      }}
    >
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.queryByText("Update available")).not.toBeInTheDocument();
  expect(screen.queryByText("Install app")).not.toBeInTheDocument();
});

test("FooterPanel renders Settings button", () => {
  render(
    <PwaWrapper>
      <FooterPanel />
    </PwaWrapper>,
  );

  expect(screen.getByRole("button", { name: /settings/i })).toBeInTheDocument();
});

test("FooterPanel calls onOpenSettings when Settings button is clicked", async () => {
  const user = userEvent.setup();
  const onOpenSettings = vi.fn();

  render(
    <PwaWrapper>
      <FooterPanel onOpenSettings={onOpenSettings} />
    </PwaWrapper>,
  );

  const settingsButton = screen.getByRole("button", { name: /settings/i });
  await user.click(settingsButton);

  expect(onOpenSettings).toHaveBeenCalled();
});
