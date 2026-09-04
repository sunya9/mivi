import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { createMockPwaState } from "tests/pwa-mock";
import { expect, test, vi } from "vitest";

import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";
import { PwaContext, PwaState } from "@/contexts/pwa-context";

type Props = ComponentProps<typeof MobileBottomNav>;

function renderNav(props: Partial<Props> = {}, pwaState?: Partial<PwaState>) {
  const onValueChange = vi.fn<Props["onValueChange"]>();
  const { container } = render(
    <PwaContext value={createMockPwaState(pwaState)}>
      <MobileBottomNav value="tracks" onValueChange={onValueChange} {...props} />
    </PwaContext>,
  );
  return { onValueChange, container };
}

test("MobileBottomNav renders all four tabs", () => {
  renderNav();

  expect(screen.getByText("Tracks")).toBeInTheDocument();
  expect(screen.getByText("Audio/Bg")).toBeInTheDocument();
  expect(screen.getByText("Style")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
});

test("MobileBottomNav highlights the active tab", () => {
  renderNav({ value: "visualizer" });

  const audioBgTab = screen.getByRole("tab", { name: /audio\/bg/i });
  expect(audioBgTab).toHaveAttribute("data-active");
});

test("MobileBottomNav calls onValueChange when tab is clicked", async () => {
  const user = userEvent.setup();
  const { onValueChange } = renderNav();

  await user.click(screen.getByRole("tab", { name: /style/i }));

  expect(onValueChange).toHaveBeenCalledWith("style");
});

test("MobileBottomNav applies custom className", () => {
  const { container } = renderNav({ className: "custom-class" });

  const nav = container.firstChild;
  expect(nav).toHaveClass("custom-class");
});

test("MobileBottomNav shows tracks tab as active by default when value is tracks", () => {
  renderNav();

  const tracksTab = screen.getByRole("tab", { name: /tracks/i });
  expect(tracksTab).toHaveAttribute("data-active");
});

test("MobileBottomNav calls onValueChange with correct value for each tab", async () => {
  const user = userEvent.setup();
  const { onValueChange } = renderNav();

  await user.click(screen.getByRole("tab", { name: /audio\/bg/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("visualizer");

  await user.click(screen.getByRole("tab", { name: /style/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("style");

  await user.click(screen.getByRole("tab", { name: /settings/i }));
  expect(onValueChange).toHaveBeenLastCalledWith("settings");
});

test("MobileBottomNav renders icons for each tab", () => {
  renderNav();

  const svgIcons = document.querySelectorAll("svg");
  expect(svgIcons).toHaveLength(4);
});

test("MobileBottomNav does not show indicator when needRefresh is false", () => {
  renderNav({}, { needRefresh: [false, vi.fn<PwaState["needRefresh"][1]>()] });

  const pingIndicator = document.querySelector(".animate-ping");
  expect(pingIndicator).not.toBeInTheDocument();
});

test("MobileBottomNav shows indicator on Settings tab when needRefresh is true", () => {
  renderNav({}, { needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()] });

  const pingIndicator = document.querySelector(".animate-ping");
  expect(pingIndicator).toBeInTheDocument();
});

test("MobileBottomNav shows indicator only on Settings tab icon", () => {
  renderNav({}, { needRefresh: [true, vi.fn<PwaState["needRefresh"][1]>()] });

  const pingIndicators = document.querySelectorAll(".animate-ping");
  expect(pingIndicators).toHaveLength(1);

  const settingsTab = screen.getByRole("tab", { name: /settings/i });
  const indicatorInSettings = settingsTab.querySelector(".animate-ping");
  expect(indicatorInSettings).toBeInTheDocument();
});
