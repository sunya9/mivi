import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { createMockAppContext, customRender } from "tests/util";
import { expect, test, vi } from "vitest";

import { VisualizerPlayer } from "@/components/app/visualizer-player";
import { type PlaybackSnapshot } from "@/lib/player/audio-playback-store";

async function renderPlayer(props?: {
  expanded?: boolean;
  onToggleExpanded?: () => void;
  snapshot?: Partial<PlaybackSnapshot>;
}) {
  const store = createMockStore({ snapshot: props?.snapshot });
  const appContextValue = createMockAppContext(store);
  return customRender(
    <VisualizerPlayer
      expanded={props?.expanded ?? false}
      onToggleExpanded={props?.onToggleExpanded ?? vi.fn<() => void>()}
    />,
    { appContextValue },
  );
}

test("renders playback controls without any expand state of its own", async () => {
  await renderPlayer();
  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Maximize" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("reflects the expanded prop on the toggle button", async () => {
  await renderPlayer({ expanded: true });
  expect(screen.getByRole("button", { name: "Minimize" })).toHaveAttribute("aria-expanded", "true");
});

test("delegates expand toggling to the parent", async () => {
  const onToggleExpanded = vi.fn<() => void>();
  await renderPlayer({ onToggleExpanded });
  await userEvent.click(screen.getByRole("button", { name: "Maximize" }));
  expect(onToggleExpanded).toHaveBeenCalledOnce();
});

test("does not own the F key shortcut", async () => {
  const onToggleExpanded = vi.fn<() => void>();
  await renderPlayer({ onToggleExpanded });
  await userEvent.keyboard("f");
  expect(onToggleExpanded).not.toHaveBeenCalled();
});

function getControls() {
  return screen.getByRole("group", { name: "Midi Visualizer Controls" });
}

test("hides the controls as soon as the mouse leaves while playing", async () => {
  await renderPlayer({ snapshot: { status: "playing" } });
  const player = getControls().closest("[class*='view-transition-name:visualizer-container']")!;

  fireEvent.mouseMove(player);
  expect(getControls().className).toContain("translate-y-0");

  fireEvent.pointerLeave(player, { pointerType: "mouse" });
  expect(getControls().className).toContain("translate-y-full");
});

test("keeps the controls when a touch pointer leaves while playing", async () => {
  await renderPlayer({ snapshot: { status: "playing" } });
  const player = getControls().closest("[class*='view-transition-name:visualizer-container']")!;

  await userEvent.keyboard("m");
  expect(getControls().className).toContain("translate-y-0");

  fireEvent.pointerLeave(player, { pointerType: "touch" });
  expect(getControls().className).toContain("translate-y-0");
});

test("keeps the controls visible while a control inside has focus", async () => {
  await renderPlayer({ snapshot: { status: "playing" } });
  expect(getControls().className).toContain("focus-within:translate-y-0");
});
