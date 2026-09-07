import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { createMockAppContext, customRender } from "tests/util";
import { afterEach, expect, test, vi } from "vitest";

import { MidiVisualizer } from "@/components/app/midi-visualizer";
import type { FileDecoders } from "@/lib/file-store/file-store";
import { type MidiTracks } from "@/lib/midi/midi";
import { type PlaybackSnapshot } from "@/lib/player/audio-playback-store";
import { RendererConfig, resolutions } from "@/lib/renderers/renderer";
import { RendererController } from "@/lib/visualizer/renderer-controller";

const mockRender = vi.spyOn(RendererController.prototype, "render");
const mockSetRendererConfig = vi.spyOn(RendererController.prototype, "setRendererConfig");
const mockSetBackgroundImageBitmap = vi.spyOn(
  RendererController.prototype,
  "setBackgroundImageBitmap",
);

async function renderVisualizer(options?: {
  midiTracks?: MidiTracks;
  snapshot?: Partial<PlaybackSnapshot>;
  decoders?: Partial<FileDecoders>;
}) {
  const store = createMockStore({ snapshot: options?.snapshot });
  const appContextValue = createMockAppContext(store, options?.decoders);
  appContextValue.rendererConfigStore.set(rendererConfig);
  appContextValue.midiTracksStore.set(options?.midiTracks);
  const view = await customRender(<MidiVisualizer />, { appContextValue });
  return { ...view, store, appContextValue };
}

afterEach(() => {
  Object.defineProperty(document, "startViewTransition", {
    value: undefined,
    writable: true,
  });
});

test("renders basic controls", async () => {
  await renderVisualizer();

  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  expect(screen.getAllByRole("slider", { hidden: true })).toHaveLength(2); // seek + volume
  expect(
    within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
      hidden: true,
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/0:00 \/ 0:10/)).toBeInTheDocument();
});

test("handles volume control", async () => {
  const { store } = await renderVisualizer();

  // Volume slider is always visible (no longer in HoverCard)
  const volumeSlider = within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
    hidden: true,
  });
  volumeSlider.focus();
  await userEvent.keyboard("{arrowleft}");

  expect(store.setVolume).toHaveBeenLastCalledWith(0.99);
});

test("handles seek control with keyboard", async () => {
  const { store } = await renderVisualizer();

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  await userEvent.keyboard("{arrowright}");

  expect(store.seek).toHaveBeenCalledWith(0.1);
});

test("toggle play state when space key is pressed", async () => {
  const { store } = await renderVisualizer();

  await userEvent.keyboard("{ }");

  expect(store.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while slider is focused", async () => {
  const { store } = await renderVisualizer();

  // Focus the seek slider
  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  // Verify slider is focused
  expect(document.activeElement).toBe(seekSlider);
  expect(seekSlider).toHaveAttribute("type", "range");

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(store.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while volume slider is focused", async () => {
  const { store } = await renderVisualizer();

  // Focus the volume slider
  const volumeSlider = within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
    hidden: true,
  });
  volumeSlider.focus();

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(store.togglePlay).toHaveBeenCalled();
});

function findExpandButton() {
  return screen.getByRole("button", { name: /Maximize|Minimize/i });
}

const PLAYER_NAME = "Midi Visualizer Player";

function getCollapsedPlayer() {
  return screen.getByRole("region", { name: PLAYER_NAME });
}

function getExpandedPlayer() {
  return screen.getByRole("dialog", { name: PLAYER_NAME });
}

function queryExpandedPlayer() {
  return screen.queryByRole("dialog", { name: PLAYER_NAME });
}

// --- Expand UI tests ---
test("should not be expanded initially", async () => {
  await renderVisualizer();

  expect(queryExpandedPlayer()).not.toBeInTheDocument();
  expect(getCollapsedPlayer()).not.toHaveAttribute("aria-modal");
  expect(findExpandButton()).toHaveAttribute("aria-expanded", "false");
});

test("should expand when expand button is clicked", async () => {
  await renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  const player = getExpandedPlayer();
  expect(player).toHaveAttribute("aria-modal", "true");
  expect(player).not.toHaveAttribute("aria-expanded");
  expect(findExpandButton()).toHaveAttribute("aria-expanded", "true");
});

test("does not focus the player on mount", async () => {
  await renderVisualizer();
  expect(getCollapsedPlayer()).not.toHaveFocus();
});

test("moves focus to the player when expanded", async () => {
  await renderVisualizer();
  await userEvent.click(findExpandButton());
  expect(getExpandedPlayer()).toHaveFocus();
});

test("moves focus to the player when expanded with F key", async () => {
  await renderVisualizer();
  await userEvent.keyboard("f");
  expect(getExpandedPlayer()).toHaveFocus();
});

test("keeps focus on the player when collapsed", async () => {
  await renderVisualizer();
  await userEvent.click(findExpandButton());
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(getCollapsedPlayer()).toHaveFocus());
});

test("tab from the last element wraps to the first element", async () => {
  await renderVisualizer();
  await userEvent.click(findExpandButton());
  findExpandButton().focus();
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
});

test("shift+tab from the first element wraps to the last element", async () => {
  await renderVisualizer();
  await userEvent.click(findExpandButton());
  await userEvent.tab();
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  await userEvent.tab({ shift: true });
  expect(findExpandButton()).toHaveFocus();
});

test("close button has an accessible name when expanded", async () => {
  await renderVisualizer();
  await userEvent.click(findExpandButton());
  expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
});

test("should call View Transitions API when expanding", async () => {
  document.startViewTransition = vi.fn<typeof document.startViewTransition>();
  await renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(document.startViewTransition).toHaveBeenCalled();
});

test("should collapse when ESC key is pressed", async () => {
  await renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  await userEvent.keyboard("{Escape}");
  expect(queryExpandedPlayer()).not.toBeInTheDocument();
});

test("should collapse when background is clicked", async () => {
  await renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  await userEvent.click(getExpandedPlayer());
  expect(queryExpandedPlayer()).not.toBeInTheDocument();
});

test("should work without View Transitions API support", async () => {
  await renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(getExpandedPlayer()).toBeInTheDocument();
});

// --- Canvas invalidation tests ---
test("should call render when midiTracks changes", async () => {
  const { appContextValue } = await renderVisualizer({ midiTracks: testMidiTracks });

  const initialCallCount = mockRender.mock.calls.length;

  // Update midiTracks with different color
  const updatedMidiTracks = {
    ...testMidiTracks,
    tracks: testMidiTracks.tracks.map((track) => ({
      ...track,
      config: { ...track.config, color: "#000000" },
    })),
  };

  act(() => appContextValue.midiTracksStore.set(updatedMidiTracks));

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
});

test("should call render when rendererConfig changes", async () => {
  const { appContextValue } = await renderVisualizer();

  const initialCallCount = mockRender.mock.calls.length;

  // Update rendererConfig
  const updatedRendererConfig: RendererConfig = {
    ...rendererConfig,
    resolution: resolutions[0],
  };

  act(() => appContextValue.rendererConfigStore.set(updatedRendererConfig));

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetRendererConfig).toHaveBeenCalledWith(updatedRendererConfig);
});

test("should call render when backgroundImageBitmap changes", async () => {
  const mockImageBitmap = await createImageBitmap(new OffscreenCanvas(100, 100));
  const { appContextValue } = await renderVisualizer({
    decoders: { backgroundImage: async () => mockImageBitmap },
  });

  const initialCallCount = mockRender.mock.calls.length;

  await act(() => appContextValue.fileStore.backgroundImage.setFile(new File([], "bg.png")));

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledWith(mockImageBitmap);
});

// --- Mute tests ---
test("clicking mute button calls toggleMute", async () => {
  const { store } = await renderVisualizer();

  const muteButton = screen.getByRole("button", { name: "Mute" });
  await userEvent.click(muteButton);

  expect(store.toggleMute).toHaveBeenCalled();
});

test("mute button shows correct state when unmuted", async () => {
  await renderVisualizer({ snapshot: { muted: false } });

  const muteButton = screen.getByRole("button", { name: "Mute" });
  expect(muteButton).toHaveAttribute("aria-pressed", "false");
});

test("mute button shows correct state when muted", async () => {
  await renderVisualizer({ snapshot: { muted: true } });

  const muteButton = screen.getByRole("button", { name: "Unmute" });
  expect(muteButton).toHaveAttribute("aria-pressed", "true");
});

test("toggle mute when 'm' key is pressed", async () => {
  const { store } = await renderVisualizer();

  await userEvent.keyboard("m");

  expect(store.toggleMute).toHaveBeenCalled();
});

test("reveal control panel when 'm' key is pressed", async () => {
  await renderVisualizer({ snapshot: { status: "playing" } });

  // When playing, panel should initially be hidden (translate-y-full)
  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("m");

  // After pressing 'm', panel should be visible (translate-y-0)
  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

// --- Keep panel visible tests ---
test("panel is always visible when not playing", async () => {
  // When not playing, panel should always be visible
  await renderVisualizer({ snapshot: { status: "paused" } });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");

  // Panel should be visible (translate-y-0) when not playing
  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

test("panel is hidden when playing and no interaction", async () => {
  // When playing with no interaction, panel should be hidden
  await renderVisualizer({ snapshot: { status: "playing" } });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");

  // Panel should be hidden (translate-y-full) when playing with no interaction
  expect(panelContainer.className).toContain("translate-y-full");
});

// --- F key expand toggle ---
test("F key toggles expand", async () => {
  await renderVisualizer();

  expect(queryExpandedPlayer()).not.toBeInTheDocument();

  await userEvent.keyboard("f");
  expect(getExpandedPlayer()).toBeInTheDocument();

  await userEvent.keyboard("f");
  expect(queryExpandedPlayer()).not.toBeInTheDocument();
});

// --- Arrow key seek tests ---
test("arrow left seeks backward 0.1s", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("{arrowleft}");

  expect(store.seek).toHaveBeenCalledWith(29.9);
});

test("arrow right seeks forward 0.1s", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("{arrowright}");

  expect(store.seek).toHaveBeenCalledWith(30.1);
});

test("arrow keys do not seek when slider is focused", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  await userEvent.keyboard("{arrowleft}");

  // seek is called via slider's onValueCommit, not by our hotkey
  // Our hotkey handler should not fire when slider is focused
  // The slider's own handler calls seek with step-based values, not ±5s
  expect(store.seek).not.toHaveBeenCalledWith(25);
});

// --- J/L seek tests ---
test("J key seeks backward 10s", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("j");

  expect(store.seek).toHaveBeenCalledWith(20);
});

test("L key seeks forward 10s", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("l");

  expect(store.seek).toHaveBeenCalledWith(40);
});

// --- Volume key tests ---
test("arrow up increases volume", async () => {
  const { store } = await renderVisualizer({ snapshot: { volume: 0.5 } });

  await userEvent.keyboard("{arrowup}");

  expect(store.setVolume).toHaveBeenCalledWith(0.51);
});

test("arrow down decreases volume", async () => {
  const { store } = await renderVisualizer({ snapshot: { volume: 0.5 } });

  await userEvent.keyboard("{arrowdown}");

  expect(store.setVolume).toHaveBeenCalledWith(0.49);
});

test("arrow up/down do not adjust volume when slider is focused", async () => {
  const { store } = await renderVisualizer();

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  await userEvent.keyboard("{arrowup}");

  // Our hotkey handler should not fire — let slider handle it natively
  expect(store.setVolume).not.toHaveBeenCalled();
});

// --- Home/0/End tests ---
test("Home key seeks to beginning", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("{home}");

  expect(store.seek).toHaveBeenCalledWith(0);
});

test("0 key seeks to beginning", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("0");

  expect(store.seek).toHaveBeenCalledWith(0);
});

test("End key seeks to end", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 30 },
  });

  await userEvent.keyboard("{end}");

  expect(store.seek).toHaveBeenCalledWith(60);
});

// --- Seek/volume shortcuts reveal control panel ---
test("seek shortcuts reveal control panel", async () => {
  await renderVisualizer({
    snapshot: { status: "playing", duration: 60, position: 30 },
  });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("{arrowright}");

  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

test("volume shortcuts reveal control panel", async () => {
  await renderVisualizer({ snapshot: { status: "playing", volume: 0.5 } });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("{arrowup}");

  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

// --- Seek clamps to boundaries ---
test("seek does not go below 0", async () => {
  const { store } = await renderVisualizer({ snapshot: { position: 0.05 } });

  await userEvent.keyboard("{arrowleft}");

  expect(store.seek).toHaveBeenCalledWith(0);
});

test("seek does not exceed duration", async () => {
  const { store } = await renderVisualizer({
    snapshot: { duration: 60, position: 59.95 },
  });

  await userEvent.keyboard("{arrowright}");

  expect(store.seek).toHaveBeenCalledWith(60);
});
