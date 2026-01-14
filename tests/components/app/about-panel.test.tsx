import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AboutPanel } from "@/components/app/about-panel";
import { PwaContext, PwaState } from "@/pwa/pwa-update-context";
import { createMockPwaState } from "../../pwa-mock";

/**
 * Wrapper component that provides PwaContext for testing.
 */
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

test("AboutPanel renders About content", () => {
  render(
    <PwaWrapper>
      <AboutPanel />
    </PwaWrapper>,
  );

  // AboutPanel should render (footer element)
  expect(document.querySelector("footer")).toBeInTheDocument();
});

test("AboutPanel does not show Update button when needRefresh is false", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [false, vi.fn()] }}>
      <AboutPanel />
    </PwaWrapper>,
  );

  expect(screen.queryByText("Update available")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /update/i }),
  ).not.toBeInTheDocument();
});

test("AboutPanel shows Update elements when needRefresh is true", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [true, vi.fn()] }}>
      <AboutPanel />
    </PwaWrapper>,
  );

  // Both desktop (badge) and mobile (item) versions are rendered
  // Desktop has hidden class, mobile doesn't - both contain "Update available"
  const updateElements = screen.getAllByText("Update available");
  expect(updateElements.length).toBeGreaterThan(0);
});

test("AboutPanel calls updateServiceWorker when desktop Update badge is clicked", async () => {
  const user = userEvent.setup();
  const updateServiceWorker = vi.fn();

  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [true, vi.fn()],
        updateServiceWorker,
      }}
    >
      <AboutPanel />
    </PwaWrapper>,
  );

  // Click the desktop badge button (data-slot="badge")
  const updateBadge = document.querySelector('[data-slot="badge"]');
  expect(updateBadge).toBeInTheDocument();
  await user.click(updateBadge as Element);

  expect(updateServiceWorker).toHaveBeenCalled();
});

test("AboutPanel calls updateServiceWorker when mobile Update button is clicked", async () => {
  const user = userEvent.setup();
  const updateServiceWorker = vi.fn();

  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [true, vi.fn()],
        updateServiceWorker,
      }}
    >
      <AboutPanel />
    </PwaWrapper>,
  );

  // Click the mobile "Update" button (inside ItemActions)
  const updateButtons = screen.getAllByRole("button", { name: /^update$/i });
  // The mobile button should exist
  expect(updateButtons.length).toBeGreaterThan(0);
  await user.click(updateButtons[0]);

  expect(updateServiceWorker).toHaveBeenCalled();
});

test("AboutPanel does not show Install button when canInstall is false", () => {
  render(
    <PwaWrapper pwaState={{ canInstall: false }}>
      <AboutPanel />
    </PwaWrapper>,
  );

  expect(screen.queryByText("Install app")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /install/i }),
  ).not.toBeInTheDocument();
});

test("AboutPanel shows Install elements when canInstall is true", () => {
  render(
    <PwaWrapper pwaState={{ canInstall: true }}>
      <AboutPanel />
    </PwaWrapper>,
  );

  // Both desktop and mobile versions are rendered
  const installElements = screen.getAllByText("Install app");
  expect(installElements.length).toBeGreaterThan(0);
});

test("AboutPanel calls installPwa when desktop Install button is clicked", async () => {
  const user = userEvent.setup();
  const installPwa = vi.fn();

  render(
    <PwaWrapper
      pwaState={{
        canInstall: true,
        installPwa,
      }}
    >
      <AboutPanel />
    </PwaWrapper>,
  );

  // Click the desktop "Install app" button (the one with full text)
  const installButtons = screen.getAllByRole("button", {
    name: /install app/i,
  });
  expect(installButtons.length).toBeGreaterThan(0);
  await user.click(installButtons[0]);

  expect(installPwa).toHaveBeenCalled();
});

test("AboutPanel calls installPwa when mobile Install button is clicked", async () => {
  const user = userEvent.setup();
  const installPwa = vi.fn();

  render(
    <PwaWrapper
      pwaState={{
        canInstall: true,
        installPwa,
      }}
    >
      <AboutPanel />
    </PwaWrapper>,
  );

  // Click the mobile "Install" button (inside ItemActions, just "Install")
  const installButtons = screen.getAllByRole("button", {
    name: /^install$/i,
  });
  // The mobile button should exist
  expect(installButtons.length).toBeGreaterThan(0);
  await user.click(installButtons[0]);

  expect(installPwa).toHaveBeenCalled();
});

test("AboutPanel shows both buttons when needRefresh and canInstall are true", () => {
  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [true, vi.fn()],
        canInstall: true,
      }}
    >
      <AboutPanel />
    </PwaWrapper>,
  );

  // Both desktop and mobile versions render, so use getAllByText
  const updateElements = screen.getAllByText("Update available");
  const installElements = screen.getAllByText("Install app");
  expect(updateElements.length).toBeGreaterThan(0);
  expect(installElements.length).toBeGreaterThan(0);
});

test("AboutPanel shows neither button when both are false", () => {
  render(
    <PwaWrapper
      pwaState={{
        needRefresh: [false, vi.fn()],
        canInstall: false,
      }}
    >
      <AboutPanel />
    </PwaWrapper>,
  );

  expect(screen.queryByText("Update available")).not.toBeInTheDocument();
  expect(screen.queryByText("Install app")).not.toBeInTheDocument();
});
