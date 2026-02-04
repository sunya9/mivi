import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
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

test("MobileBottomNav renders all four tabs", () => {
  render(
    <PwaWrapper>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  expect(screen.getByText("Tracks")).toBeInTheDocument();
  expect(screen.getByText("Audio/Bg")).toBeInTheDocument();
  expect(screen.getByText("Style")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
});

test("MobileBottomNav highlights the active tab", () => {
  render(
    <PwaWrapper>
      <MobileBottomNav value="visualizer" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  const audioBgTab = screen.getByRole("tab", { name: /audio\/bg/i });
  expect(audioBgTab).toHaveAttribute("data-state", "active");
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

  await user.click(screen.getByRole("tab", { name: /audio\/bg/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("visualizer");

  await user.click(screen.getByRole("tab", { name: /style/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("style");

  await user.click(screen.getByRole("tab", { name: /settings/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("settings");
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

  const pingIndicator = document.querySelector(".animate-ping");
  expect(pingIndicator).not.toBeInTheDocument();
});

test("MobileBottomNav shows indicator on Settings tab when needRefresh is true", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [true, vi.fn()] }}>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  const pingIndicator = document.querySelector(".animate-ping");
  expect(pingIndicator).toBeInTheDocument();
});

test("MobileBottomNav shows indicator only on Settings tab icon", () => {
  render(
    <PwaWrapper pwaState={{ needRefresh: [true, vi.fn()] }}>
      <MobileBottomNav value="tracks" onValueChange={vi.fn()} />
    </PwaWrapper>,
  );

  const pingIndicators = document.querySelectorAll(".animate-ping");
  expect(pingIndicators).toHaveLength(1);

  const settingsTab = screen.getByRole("tab", { name: /settings/i });
  const indicatorInSettings = settingsTab.querySelector(".animate-ping");
  expect(indicatorInSettings).toBeInTheDocument();
});
