import { afterEach, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";
import { useAudioPlaybackStore } from "@/lib/player/use-audio-playback-store";
import { RendererController } from "@/components/app/renderer-controller";
import { RendererConfig, resolutions } from "@/lib/renderers/renderer";

const mockRender = vi.spyOn(RendererController.prototype, "render");
const mockSetRendererConfig = vi.spyOn(
  RendererController.prototype,
  "setRendererConfig",
);
const mockSetBackgroundImageBitmap = vi.spyOn(
  RendererController.prototype,
  "setBackgroundImageBitmap",
);

const defaultStoreMock: ReturnType<typeof useAudioPlaybackStore> = {
  snapshot: {
    audioBuffer: undefined,
    isPlaying: false,
    position: 0,
    duration: 10,
    volume: 1,
    muted: false,
  },
  seek: vi.fn(),
  togglePlay: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
  syncPosition: vi.fn(),
  setAudioBuffer: vi.fn(),
  getPosition: () => 0,
};

// Mock the useAudioPlaybackStore hook
vi.mock("@/lib/player/use-audio-playback-store", () => ({
  useAudioPlaybackStore: vi.fn(() => defaultStoreMock),
}));

afterEach(() => {
  Object.defineProperty(document, "startViewTransition", {
    value: undefined,
    writable: true,
  });
});

test("renders basic controls", () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  expect(screen.getAllByRole("slider")).toHaveLength(2); // seek + volume
  expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  expect(screen.getByText(/0:00 \/ 0:10/)).toBeInTheDocument();
});

test("handles volume control", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  // Volume slider is always visible (no longer in HoverCard)
  const volumeSlider = screen.getByRole("slider", { name: "Volume" });
  await userEvent.click(volumeSlider);
  await userEvent.keyboard("{arrowleft}");

  expect(defaultStoreMock.setVolume).toHaveBeenLastCalledWith(0.99);
});

test("handles seek control", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  // First slider is the seek bar, second is volume
  const seekSlider = screen.getAllByRole("slider")[0];
  await userEvent.click(seekSlider);
  await userEvent.keyboard("{arrowright}");

  // 3rd param: seamless (false = mouse/standard seek, true = keyboard/seamless seek)
  // In test environment, onLostPointerCapture may not fire, so isMouseSeekingRef stays true
  expect(defaultStoreMock.seek).toHaveBeenNthCalledWith(1, 0.1, true, false);
  expect(defaultStoreMock.seek).toHaveBeenNthCalledWith(2, 0.1, false, false);
});

test("toggle play state when space key is pressed", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("{ }");

  expect(defaultStoreMock.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while slider is focused", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  // Focus the seek slider
  const seekSlider = screen.getAllByRole("slider")[0];
  await userEvent.click(seekSlider);

  // Verify slider is focused
  expect(document.activeElement).toBe(seekSlider);
  expect(seekSlider.getAttribute("role")).toBe("slider");

  // Clear previous calls
  vi.mocked(defaultPlayerMock.togglePlay).mockClear();

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(defaultPlayerMock.togglePlay).toHaveBeenCalled();
});

test("toggle play state when space key is pressed while volume slider is focused", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  // Focus the volume slider
  const volumeSlider = screen.getByRole("slider", { name: "Volume" });
  await userEvent.click(volumeSlider);

  // Clear previous calls
  vi.mocked(defaultPlayerMock.togglePlay).mockClear();

  // Press space while slider is focused
  await userEvent.keyboard("{ }");

  expect(defaultPlayerMock.togglePlay).toHaveBeenCalled();
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
    <MidiVisualizer
      rendererConfig={rendererConfig}
      midiTracks={expectedMidiTracks}
    />,
  );

  const initialCallCount = mockRender.mock.calls.length;

  // Update midiTracks with different color
  const updatedMidiTracks = {
    ...expectedMidiTracks,
    tracks: expectedMidiTracks.tracks.map((track) => ({
      ...track,
      config: { ...track.config, color: "#000000" },
    })),
  };

  rerender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      midiTracks={updatedMidiTracks}
    />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
});

test("should call render when rendererConfig changes", () => {
  const { rerender } = customRender(
    <MidiVisualizer rendererConfig={rendererConfig} />,
  );

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
  const { rerender } = customRender(
    <MidiVisualizer rendererConfig={rendererConfig} />,
  );

  const initialCallCount = mockRender.mock.calls.length;

  // Create a mock ImageBitmap
  const imgEl = document.createElement("img");
  const mockImageBitmap = await createImageBitmap(imgEl);

  rerender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      backgroundImageBitmap={mockImageBitmap}
    />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledWith(mockImageBitmap);
});

// --- Mute shortcut tests ---
test("should toggle mute when 'm' key is pressed", async () => {
  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("m");

  expect(defaultStoreMock.toggleMute).toHaveBeenCalled();
});

test("should reveal control panel when 'm' key is pressed", async () => {
  vi.mocked(useAudioPlaybackStore).mockReturnValue({
    ...defaultStoreMock,
    snapshot: { ...defaultStoreMock.snapshot, isPlaying: true },
  });

  customRender(<MidiVisualizer rendererConfig={rendererConfig} />);

  await userEvent.keyboard("m");

  const playerContainer = findPlayer().querySelector("[data-is-mute-revealed]");
  expect(playerContainer).toHaveAttribute("data-is-mute-revealed", "true");
});

// --- Keep panel visible tests ---
test("should keep panel visible when paused while panel was showing via hover", async () => {
  vi.mocked(useAudioPlaybackStore).mockReturnValue({
    ...defaultStoreMock,
    snapshot: { ...defaultStoreMock.snapshot, isPlaying: true },
  });

  const { rerender } = customRender(
    <MidiVisualizer rendererConfig={rendererConfig} />,
  );

  const playerContainer = findPlayer().querySelector(
    "[data-keep-panel-visible]",
  );

  // Simulate mouse enter to trigger hover state
  await userEvent.hover(playerContainer!);

  // Click play button to pause (isPlaying will change from true to false)
  const playButton = screen.getByRole("button", { name: "Pause" });
  await userEvent.click(playButton);

  // Check that keepPanelVisible is true
  expect(playerContainer).toHaveAttribute("data-keep-panel-visible", "true");

  // Rerender with isPlaying: false to verify state persists
  vi.mocked(useAudioPlaybackStore).mockReturnValue({
    ...defaultStoreMock,
    snapshot: { ...defaultStoreMock.snapshot, isPlaying: false },
  });

  rerender(<MidiVisualizer rendererConfig={rendererConfig} />);

  // Panel should still have keepPanelVisible true
  expect(playerContainer).toHaveAttribute("data-keep-panel-visible", "true");
});
