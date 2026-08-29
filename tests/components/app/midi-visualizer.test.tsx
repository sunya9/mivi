import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps } from "react";
import { AudioContext } from "standardized-audio-context-mock";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { customRender } from "tests/util";
import { afterEach, expect, test, vi } from "vitest";

import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { RendererController } from "@/components/app/renderer-controller";
import { type AppContextValue } from "@/contexts/app-context";
import { type AudioPlaybackStore, type PlaybackSnapshot } from "@/lib/player/audio-playback-store";
import { RendererConfig, resolutions } from "@/lib/renderers/renderer";

const mockRender = vi.spyOn(RendererController.prototype, "render");
const mockSetRendererConfig = vi.spyOn(RendererController.prototype, "setRendererConfig");
const mockSetBackgroundImageBitmap = vi.spyOn(
  RendererController.prototype,
  "setBackgroundImageBitmap",
);

const defaultSnapshot: PlaybackSnapshot = {
  isPlaying: false,
  position: 0,
  duration: 10,
  volume: 1,
  muted: false,
};

type Props = ComponentProps<typeof MidiVisualizer>;

function renderVisualizer(options?: {
  props?: Partial<Props>;
  snapshot?: Partial<PlaybackSnapshot>;
  getPosition?: () => number;
}) {
  const snapshot: PlaybackSnapshot = { ...defaultSnapshot, ...options?.snapshot };
  const store = {
    subscribe: vi.fn<AudioPlaybackStore["subscribe"]>(() => () => {}),
    getSnapshot: vi.fn<AudioPlaybackStore["getSnapshot"]>(() => snapshot),
    seek: vi.fn<AudioPlaybackStore["seek"]>(),
    togglePlay: vi.fn<AudioPlaybackStore["togglePlay"]>(),
    setVolume: vi.fn<AudioPlaybackStore["setVolume"]>(),
    toggleMute: vi.fn<AudioPlaybackStore["toggleMute"]>(),
    syncFromAudioContext: vi.fn<AudioPlaybackStore["syncFromAudioContext"]>(),
    setAudioBuffer: vi.fn<AudioPlaybackStore["setAudioBuffer"]>(),
    getPosition: vi.fn<AudioPlaybackStore["getPosition"]>(options?.getPosition ?? (() => 0)),
    getFrequencyData: vi.fn<AudioPlaybackStore["getFrequencyData"]>(() => null),
  } satisfies AudioPlaybackStore;
  const appContextValue: AppContextValue = {
    audioContext: new AudioContext(),
    audioPlaybackStore: store,
  };
  const view = customRender(
    <MidiVisualizer rendererConfig={rendererConfig} {...options?.props} />,
    {
      appContextValue,
    },
  );
  return { ...view, store };
}

afterEach(() => {
  Object.defineProperty(document, "startViewTransition", {
    value: undefined,
    writable: true,
  });
});

test("renders basic controls", () => {
  renderVisualizer();

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
  const { store } = renderVisualizer();

  // Volume slider is always visible (no longer in HoverCard)
  const volumeSlider = within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
    hidden: true,
  });
  volumeSlider.focus();
  await userEvent.keyboard("{arrowleft}");

  expect(store.setVolume).toHaveBeenLastCalledWith(0.99);
});

test("handles seek control with keyboard", async () => {
  const { store } = renderVisualizer();

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  await userEvent.keyboard("{arrowright}");

  // Keyboard triggers onValueCommit with commit=true, seamless=true
  expect(store.seek).toHaveBeenCalledWith(0.1, true, true);
});

test("toggle play state when space key is pressed", async () => {
  const { store } = renderVisualizer();

  await userEvent.keyboard("{ }");

  expect(store.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while slider is focused", async () => {
  const { store } = renderVisualizer();

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
  const { store } = renderVisualizer();

  // Focus the volume slider
  const volumeSlider = within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
    hidden: true,
  });
  volumeSlider.focus();

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(store.togglePlay).toHaveBeenCalled();
});

function findPlayer() {
  return screen.getByLabelText("Midi Visualizer Player");
}

// --- Expand UI tests ---
test("should not be expanded initially", () => {
  renderVisualizer();

  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

test("should expand when expand button is clicked", async () => {
  renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");
});

test("should call View Transitions API when expanding", async () => {
  document.startViewTransition = vi.fn<typeof document.startViewTransition>();
  renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(document.startViewTransition).toHaveBeenCalled();
});

test("should collapse when ESC key is pressed", async () => {
  renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  await userEvent.keyboard("{Escape}");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

test("should collapse when background is clicked", async () => {
  renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  const container = findPlayer();
  await userEvent.click(container);
  expect(container).toHaveAttribute("aria-expanded", "false");
});

test("should work without View Transitions API support", async () => {
  renderVisualizer();
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");
});

// --- Canvas invalidation tests ---
test("should call render when midiTracks changes", () => {
  const { rerender } = renderVisualizer({ props: { midiTracks: testMidiTracks } });

  const initialCallCount = mockRender.mock.calls.length;

  // Update midiTracks with different color
  const updatedMidiTracks = {
    ...testMidiTracks,
    tracks: testMidiTracks.tracks.map((track) => ({
      ...track,
      config: { ...track.config, color: "#000000" },
    })),
  };

  rerender(<MidiVisualizer rendererConfig={rendererConfig} midiTracks={updatedMidiTracks} />);

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
});

test("should call render when rendererConfig changes", () => {
  const { rerender } = renderVisualizer();

  const initialCallCount = mockRender.mock.calls.length;

  // Update rendererConfig
  const updatedRendererConfig: RendererConfig = {
    ...rendererConfig,
    resolution: resolutions[0],
  };

  rerender(<MidiVisualizer rendererConfig={updatedRendererConfig} />);

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetRendererConfig).toHaveBeenCalledWith(updatedRendererConfig);
});

test("should call render when backgroundImageBitmap changes", async () => {
  const { rerender } = renderVisualizer();

  const initialCallCount = mockRender.mock.calls.length;

  const mockImageBitmap = await createImageBitmap(new OffscreenCanvas(100, 100));

  rerender(
    <MidiVisualizer rendererConfig={rendererConfig} backgroundImageBitmap={mockImageBitmap} />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledWith(mockImageBitmap);
});

// --- Mute tests ---
test("clicking mute button calls toggleMute", async () => {
  const { store } = renderVisualizer();

  const muteButton = screen.getByRole("button", { name: "Mute" });
  await userEvent.click(muteButton);

  expect(store.toggleMute).toHaveBeenCalled();
});

test("mute button shows correct state when unmuted", () => {
  renderVisualizer({ snapshot: { muted: false } });

  const muteButton = screen.getByRole("button", { name: "Mute" });
  expect(muteButton).toHaveAttribute("aria-pressed", "false");
});

test("mute button shows correct state when muted", () => {
  renderVisualizer({ snapshot: { muted: true } });

  const muteButton = screen.getByRole("button", { name: "Unmute" });
  expect(muteButton).toHaveAttribute("aria-pressed", "true");
});

test("toggle mute when 'm' key is pressed", async () => {
  const { store } = renderVisualizer();

  await userEvent.keyboard("m");

  expect(store.toggleMute).toHaveBeenCalled();
});

test("reveal control panel when 'm' key is pressed", async () => {
  renderVisualizer({ snapshot: { isPlaying: true } });

  // When playing, panel should initially be hidden (translate-y-full)
  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("m");

  // After pressing 'm', panel should be visible (translate-y-0)
  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

// --- Keep panel visible tests ---
test("panel is always visible when not playing", () => {
  // When not playing, panel should always be visible
  renderVisualizer({ snapshot: { isPlaying: false } });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");

  // Panel should be visible (translate-y-0) when not playing
  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

test("panel is hidden when playing and no interaction", () => {
  // When playing with no interaction, panel should be hidden
  renderVisualizer({ snapshot: { isPlaying: true } });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");

  // Panel should be hidden (translate-y-full) when playing with no interaction
  expect(panelContainer.className).toContain("translate-y-full");
});

// --- F key expand toggle ---
test("F key toggles expand", async () => {
  renderVisualizer();

  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");

  await userEvent.keyboard("f");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");

  await userEvent.keyboard("f");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

// --- Arrow key seek tests ---
test("arrow left seeks backward 0.1s", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("{arrowleft}");

  expect(store.seek).toHaveBeenCalledWith(29.9, true, true);
});

test("arrow right seeks forward 0.1s", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("{arrowright}");

  expect(store.seek).toHaveBeenCalledWith(30.1, true, true);
});

test("arrow keys do not seek when slider is focused", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  await userEvent.keyboard("{arrowleft}");

  // seek is called via slider's onValueCommit, not by our hotkey
  // Our hotkey handler should not fire when slider is focused
  // The slider's own handler calls seek with step-based values, not ±5s
  expect(store.seek).not.toHaveBeenCalledWith(25, true, true);
});

// --- J/L seek tests ---
test("J key seeks backward 10s", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("j");

  expect(store.seek).toHaveBeenCalledWith(20, true, true);
});

test("L key seeks forward 10s", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("l");

  expect(store.seek).toHaveBeenCalledWith(40, true, true);
});

// --- Volume key tests ---
test("arrow up increases volume", async () => {
  const { store } = renderVisualizer({ snapshot: { volume: 0.5 } });

  await userEvent.keyboard("{arrowup}");

  expect(store.setVolume).toHaveBeenCalledWith(0.51);
});

test("arrow down decreases volume", async () => {
  const { store } = renderVisualizer({ snapshot: { volume: 0.5 } });

  await userEvent.keyboard("{arrowdown}");

  expect(store.setVolume).toHaveBeenCalledWith(0.49);
});

test("arrow up/down do not adjust volume when slider is focused", async () => {
  const { store } = renderVisualizer();

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  await userEvent.keyboard("{arrowup}");

  // Our hotkey handler should not fire — let slider handle it natively
  expect(store.setVolume).not.toHaveBeenCalled();
});

// --- Home/0/End tests ---
test("Home key seeks to beginning", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("{home}");

  expect(store.seek).toHaveBeenCalledWith(0, true, true);
});

test("0 key seeks to beginning", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("0");

  expect(store.seek).toHaveBeenCalledWith(0, true, true);
});

test("End key seeks to end", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 30,
  });

  await userEvent.keyboard("{end}");

  expect(store.seek).toHaveBeenCalledWith(60, true, true);
});

// --- Seek/volume shortcuts reveal control panel ---
test("seek shortcuts reveal control panel", async () => {
  renderVisualizer({
    snapshot: { isPlaying: true, duration: 60 },
    getPosition: () => 30,
  });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("{arrowright}");

  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

test("volume shortcuts reveal control panel", async () => {
  renderVisualizer({ snapshot: { isPlaying: true, volume: 0.5 } });

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("{arrowup}");

  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

// --- Seek clamps to boundaries ---
test("seek does not go below 0", async () => {
  const { store } = renderVisualizer({ getPosition: () => 0.05 });

  await userEvent.keyboard("{arrowleft}");

  expect(store.seek).toHaveBeenCalledWith(0, true, true);
});

test("seek does not exceed duration", async () => {
  const { store } = renderVisualizer({
    snapshot: { duration: 60 },
    getPosition: () => 59.95,
  });

  await userEvent.keyboard("{arrowright}");

  expect(store.seek).toHaveBeenCalledWith(60, true, true);
});
