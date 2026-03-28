import { afterEach, expect, test, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { customRender as customRenderBase } from "tests/util";
import userEvent from "@testing-library/user-event";
import { testMidiTracks, rendererConfig } from "tests/fixtures";
import { RendererController } from "@/components/app/renderer-controller";
import { RendererConfig, resolutions } from "@/lib/renderers/renderer";
import { type AudioPlaybackStore, type PlaybackSnapshot } from "@/lib/player/audio-playback-store";
import { type AppContextValue } from "@/contexts/app-context";
import { AudioContext } from "standardized-audio-context-mock";

const mockRender = vi.spyOn(RendererController.prototype, "render");
const mockSetRendererConfig = vi.spyOn(RendererController.prototype, "setRendererConfig");
const mockSetBackgroundImageBitmap = vi.spyOn(
  RendererController.prototype,
  "setBackgroundImageBitmap",
);

let currentSnapshot: PlaybackSnapshot = {
  isPlaying: false,
  position: 0,
  duration: 10,
  volume: 1,
  muted: false,
};

const mockStore = {
  subscribe: vi.fn(() => () => {}),
  getSnapshot: vi.fn(() => currentSnapshot),
  seek: vi.fn(),
  togglePlay: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
  syncFromAudioContext: vi.fn(),
  setAudioBuffer: vi.fn(),
  getPosition: vi.fn(() => 0),
  getFrequencyData: vi.fn(() => null),
} satisfies AudioPlaybackStore;

const mockAppContext: AppContextValue = {
  audioContext: new AudioContext(),
  audioPlaybackStore: mockStore,
};

const defaultSnapshot: PlaybackSnapshot = { ...currentSnapshot };

function mockSnapshot(overrides: Partial<PlaybackSnapshot>, opts?: { getPosition?: () => number }) {
  currentSnapshot = { ...defaultSnapshot, ...overrides };
  if (opts?.getPosition) {
    vi.mocked(mockStore.getPosition).mockImplementation(opts.getPosition);
  }
}

function customRender(children: React.ReactNode) {
  return customRenderBase(children, { appContextValue: mockAppContext });
}

afterEach(() => {
  currentSnapshot = { ...defaultSnapshot };
  Object.defineProperty(document, "startViewTransition", {
    value: undefined,
    writable: true,
  });
});

test("renders basic controls", () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

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
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  // Volume slider is always visible (no longer in HoverCard)
  const volumeSlider = within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
    hidden: true,
  });
  volumeSlider.focus();
  await userEvent.keyboard("{arrowleft}");

  expect(mockStore.setVolume).toHaveBeenLastCalledWith(0.99);
});

test("handles seek control with keyboard", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  // Focus slider via tab (no pointer interaction)
  await userEvent.tab();
  expect(seekSlider).toHaveFocus();

  await userEvent.keyboard("{arrowright}");

  // Keyboard triggers onValueCommit with commit=true, seamless=true
  expect(mockStore.seek).toHaveBeenCalledWith(0.1, true, true);
});

test("toggle play state when space key is pressed", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{ }");

  expect(mockStore.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while slider is focused", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  // Focus the seek slider
  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  // Verify slider is focused
  expect(document.activeElement).toBe(seekSlider);
  expect(seekSlider).toHaveAttribute("type", "range");

  // Clear previous calls
  vi.mocked(mockStore.togglePlay).mockClear();

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(mockStore.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while volume slider is focused", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  // Focus the volume slider
  const volumeSlider = within(screen.getByRole("group", { name: "Volume" })).getByRole("slider", {
    hidden: true,
  });
  volumeSlider.focus();

  // Clear previous calls
  vi.mocked(mockStore.togglePlay).mockClear();

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(mockStore.togglePlay).toHaveBeenCalled();
});

function findPlayer() {
  return screen.getByLabelText("Midi Visualizer Player");
}

// --- Expand UI tests ---
test("should not be expanded initially", () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

test("should expand when expand button is clicked", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");
});

test("should call View Transitions API when expanding", async () => {
  document.startViewTransition = vi.fn();
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(document.startViewTransition).toHaveBeenCalled();
});

test("should collapse when ESC key is pressed", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  await userEvent.keyboard("{Escape}");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

test("should collapse when background is clicked", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  const container = findPlayer();
  await userEvent.click(container);
  expect(container).toHaveAttribute("aria-expanded", "false");
});

test("should work without View Transitions API support", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");
});

// --- Canvas invalidation tests ---
test("should call render when midiTracks changes", () => {
  const { rerender } = customRender(
    <MidiVisualizer rendererConfig={rendererConfig} midiTracks={testMidiTracks} />,
  );

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
  const { rerender } = customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

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
  const { rerender } = customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const initialCallCount = mockRender.mock.calls.length;

  // Create a mock ImageBitmap
  const imgEl = document.createElement("img");
  const mockImageBitmap = await createImageBitmap(imgEl);

  rerender(
    <MidiVisualizer rendererConfig={rendererConfig} backgroundImageBitmap={mockImageBitmap} />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledWith(mockImageBitmap);
});

// --- Mute tests ---
test("clicking mute button calls toggleMute", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const muteButton = screen.getByRole("button", { name: "Mute" });
  await userEvent.click(muteButton);

  expect(mockStore.toggleMute).toHaveBeenCalled();
});

test("mute button shows correct state when unmuted", () => {
  mockSnapshot({ muted: false });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const muteButton = screen.getByRole("button", { name: "Mute" });
  expect(muteButton).toHaveAttribute("aria-pressed", "false");
});

test("mute button shows correct state when muted", () => {
  mockSnapshot({ muted: true });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const muteButton = screen.getByRole("button", { name: "Unmute" });
  expect(muteButton).toHaveAttribute("aria-pressed", "true");
});

test("toggle mute when 'm' key is pressed", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("m");

  expect(mockStore.toggleMute).toHaveBeenCalled();
});

test("reveal control panel when 'm' key is pressed", async () => {
  mockSnapshot({ isPlaying: true });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

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
  mockSnapshot({ isPlaying: false });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");

  // Panel should be visible (translate-y-0) when not playing
  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

test("panel is hidden when playing and no interaction", () => {
  // When playing with no interaction, panel should be hidden
  mockSnapshot({ isPlaying: true });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");

  // Panel should be hidden (translate-y-full) when playing with no interaction
  expect(panelContainer.className).toContain("translate-y-full");
});

// --- F key expand toggle ---
test("F key toggles expand", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");

  await userEvent.keyboard("f");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");

  await userEvent.keyboard("f");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

// --- Arrow key seek tests ---
test("arrow left seeks backward 5s", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{arrowleft}");

  expect(mockStore.seek).toHaveBeenCalledWith(25, true, true);
});

test("arrow right seeks forward 5s", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{arrowright}");

  expect(mockStore.seek).toHaveBeenCalledWith(35, true, true);
});

test("arrow keys do not seek when slider is focused", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  vi.mocked(mockStore.seek).mockClear();

  await userEvent.keyboard("{arrowleft}");

  // seek is called via slider's onValueCommit, not by our hotkey
  // Our hotkey handler should not fire when slider is focused
  // The slider's own handler calls seek with step-based values, not ±5s
  expect(mockStore.seek).not.toHaveBeenCalledWith(25, true, true);
});

// --- J/L seek tests ---
test("J key seeks backward 10s", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("j");

  expect(mockStore.seek).toHaveBeenCalledWith(20, true, true);
});

test("L key seeks forward 10s", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("l");

  expect(mockStore.seek).toHaveBeenCalledWith(40, true, true);
});

// --- Volume key tests ---
test("arrow up increases volume", async () => {
  mockSnapshot({ volume: 0.5 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{arrowup}");

  expect(mockStore.setVolume).toHaveBeenCalledWith(0.55);
});

test("arrow down decreases volume", async () => {
  mockSnapshot({ volume: 0.5 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{arrowdown}");

  expect(mockStore.setVolume).toHaveBeenCalledWith(0.45);
});

test("arrow up/down do not adjust volume when slider is focused", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const seekSlider = screen.getAllByRole("slider", { hidden: true })[0];
  seekSlider.focus();

  vi.mocked(mockStore.setVolume).mockClear();

  await userEvent.keyboard("{arrowup}");

  // Our hotkey handler should not fire — let slider handle it natively
  expect(mockStore.setVolume).not.toHaveBeenCalled();
});

// --- Home/0/End tests ---
test("Home key seeks to beginning", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{home}");

  expect(mockStore.seek).toHaveBeenCalledWith(0, true, true);
});

test("0 key seeks to beginning", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("0");

  expect(mockStore.seek).toHaveBeenCalledWith(0, true, true);
});

test("End key seeks to end", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{end}");

  expect(mockStore.seek).toHaveBeenCalledWith(60, true, true);
});

// --- Seek/volume shortcuts reveal control panel ---
test("seek shortcuts reveal control panel", async () => {
  mockSnapshot({ isPlaying: true, duration: 60 }, { getPosition: () => 30 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("{arrowright}");

  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

test("volume shortcuts reveal control panel", async () => {
  mockSnapshot({ isPlaying: true, volume: 0.5 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  const panelContainer = screen.getByLabelText("Midi Visualizer Controls");
  expect(panelContainer.className).toContain("translate-y-full");

  await userEvent.keyboard("{arrowup}");

  expect(panelContainer.className).toContain("translate-y-0");
  expect(panelContainer.className).not.toContain("translate-y-full");
});

// --- Seek clamps to boundaries ---
test("seek does not go below 0", async () => {
  mockSnapshot({}, { getPosition: () => 3 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{arrowleft}");

  expect(mockStore.seek).toHaveBeenCalledWith(0, true, true);
});

test("seek does not exceed duration", async () => {
  mockSnapshot({ duration: 60 }, { getPosition: () => 58 });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{arrowright}");

  expect(mockStore.seek).toHaveBeenCalledWith(60, true, true);
});
