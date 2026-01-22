import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { PwaContext, PwaState } from "@/pwa/pwa-context";
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

test("MobileBottomNav renders all four tabs", () => {
  render(
    <PwaWrapper>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  expect(screen.getByText("Tracks")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(screen.getByText("Style")).toBeInTheDocument();
  expect(screen.getByText("About")).toBeInTheDocument();
});

test("MobileBottomNav highlights the active tab", () => {
  render(
    <PwaWrapper>
      <MobileBottomNav value="visualizer" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  const settingsTab = screen.getByRole("tab", { name: /settings/i });
  expect(settingsTab).toHaveAttribute("data-state", "active");
});

test("MobileBottomNav calls onValueChange when tab is clicked", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();

  render(
    <PwaWrapper>
      <MobileBottomNav value="tracks" onValueChange={onValueChange} />
    </PwaWrapper>,
  );

  await user.click(screen.getByRole("tab", { name: /style/i }));

  expect(onValueChange).toHaveBeenCalledWith("style");
});

test("MobileBottomNav applies custom className", () => {
  const { container } = render(
    <PwaWrapper>
      <MobileBottomNav
        value="tracks"
        onValueChange={vi.fn()}
        className="custom-class"
      />
    </PwaWrapper>,
  );

  const nav = container.firstChild;
  expect(nav).toHaveClass("custom-class");
});

test("MobileBottomNav shows tracks tab as active by default when value is tracks", () => {
  render(
    <PwaWrapper>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  const tracksTab = screen.getByRole("tab", { name: /tracks/i });
  expect(tracksTab).toHaveAttribute("data-state", "active");
});

test("MobileBottomNav calls onValueChange with correct value for each tab", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();

  render(
    <PwaWrapper>
      <MobileBottomNav value="tracks" onValueChange={onValueChange} />
    </PwaWrapper>,
  );

  await user.click(screen.getByRole("tab", { name: /settings/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("visualizer");

  await user.click(screen.getByRole("tab", { name: /style/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("style");

  await user.click(screen.getByRole("tab", { name: /about/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("about");
});

test("MobileBottomNav renders icons for each tab", () => {
  render(
    <PwaWrapper>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  const svgIcons = document.querySelectorAll("svg");
  expect(svgIcons).toHaveLength(4);
});

test("MobileBottomNav does not show indicator when needRefresh is false", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [false, vi.fn()] }}>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  // The ping indicator uses animate-ping class
  const pingIndicator = document.querySelector(".animate-ping");
  expect(pingIndicator).not.toBeInTheDocument();
});

test("MobileBottomNav shows indicator on About tab when needRefresh is true", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [true, vi.fn()] }}>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  // The ping indicator uses animate-ping class
  const pingIndicator = document.querySelector(".animate-ping");
  expect(pingIndicator).toBeInTheDocument();
});

test("MobileBottomNav shows indicator only on About tab icon", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [true, vi.fn()] }}>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  // Should have exactly one ping indicator
  const pingIndicators = document.querySelectorAll(".animate-ping");
  expect(pingIndicators).toHaveLength(1);

  // The indicator should be within the About tab
  const aboutTab = screen.getByRole("tab", { name: /about/i });
  const indicatorInAbout = aboutTab.querySelector(".animate-ping");
  expect(indicatorInAbout).toBeInTheDocument();
});
