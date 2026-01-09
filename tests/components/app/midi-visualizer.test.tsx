import { afterEach, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";
import { expectedMidiTracks, rendererConfig } from "tests/fixtures";
import { usePlayer } from "@/lib/player/use-player";
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

const defaultPlayerMock: ReturnType<typeof usePlayer> = {
  seek: vi.fn(),
  togglePlay: vi.fn(),
  volume: 1,
  setVolume: vi.fn(),
  muted: false,
  isPlaying: false,
  getCurrentTime: () => 0,
  updateCurrentTime: vi.fn(),
  currentTimeSec: 0,
  toggleMute: vi.fn(),
  makeSureToCommit: vi.fn(),
};

// Mock the usePlayer hook
vi.mock("@/lib/player/use-player", () => ({
  usePlayer: vi.fn(() => defaultPlayerMock),
}));

class MockedAudioBuffer implements AudioBuffer {
  copyFromChannel: AudioBuffer["copyFromChannel"];
  copyToChannel: AudioBuffer["copyToChannel"];
  getChannelData: AudioBuffer["getChannelData"];

  constructor(
    public readonly duration: number,
    public readonly sampleRate: number = 44100,
    public readonly numberOfChannels: number = 2,
    methods: Partial<AudioBuffer> = {
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
      getChannelData: vi.fn(),
    },
  ) {
    this.copyFromChannel = methods.copyFromChannel ?? vi.fn();
    this.copyToChannel = methods.copyToChannel ?? vi.fn();
    this.getChannelData = methods.getChannelData ?? vi.fn();
  }

  get length(): number {
    return Math.floor(this.duration * this.sampleRate);
  }
}

const mockAudioBuffer = new MockedAudioBuffer(10);

afterEach(() => {
  Object.defineProperty(document, "startViewTransition", {
    value: undefined,
    writable: true,
  });
});

test("renders basic controls", () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  expect(screen.getAllByRole("slider")).toHaveLength(2); // seek + volume
  expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
  expect(screen.getByText(/0:00 \/ 0:10/)).toBeInTheDocument();
});

test("handles volume control", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  // Volume slider is always visible (no longer in HoverCard)
  const volumeSlider = screen.getByRole("slider", { name: "Volume" });
  await userEvent.click(volumeSlider);
  await userEvent.keyboard("{arrowleft}");

  expect(defaultPlayerMock.setVolume).toHaveBeenLastCalledWith(0.99);
});

test("handles seek control", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  // First slider is the seek bar, second is volume
  const seekSlider = screen.getAllByRole("slider")[0];
  await userEvent.click(seekSlider);
  await userEvent.keyboard("{arrowright}");

  expect(defaultPlayerMock.seek).toHaveBeenNthCalledWith(1, 0.1, true);
  expect(defaultPlayerMock.seek).toHaveBeenNthCalledWith(2, 0.1, false);
});

test("toggle play state when space key is pressed", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  await userEvent.keyboard("{ }");

  expect(defaultPlayerMock.togglePlay).toHaveBeenCalled();
});

function findPlayer() {
  return screen.getByLabelText("Midi Visualizer Player");
}

// --- Expand UI tests ---
test("should not be expanded initially", () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

test("should expand when expand button is clicked", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");
});

test("should call View Transitions API when expanding", async () => {
  document.startViewTransition = vi.fn();
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(document.startViewTransition).toHaveBeenCalled();
});

test("should collapse when ESC key is pressed", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  await userEvent.keyboard("{Escape}");
  expect(findPlayer()).toHaveAttribute("aria-expanded", "false");
});

test("should collapse when background is clicked", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  const container = findPlayer();
  await userEvent.click(container);
  expect(container).toHaveAttribute("aria-expanded", "false");
});

test("should work without View Transitions API support", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );
  const expandButton = screen.getByRole("button", { name: /Maximize/i });
  await userEvent.click(expandButton);
  expect(findPlayer()).toHaveAttribute("aria-expanded", "true");
});

// --- Canvas invalidation tests ---
test("should call render when midiTracks changes", () => {
  const { rerender } = customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
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
      audioBuffer={mockAudioBuffer}
      midiTracks={updatedMidiTracks}
    />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
});

test("should call render when rendererConfig changes", () => {
  const { rerender } = customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  const initialCallCount = mockRender.mock.calls.length;

  // Update rendererConfig
  const updatedRendererConfig: RendererConfig = {
    ...rendererConfig,
    resolution: resolutions[0],
  };

  rerender(
    <MidiVisualizer
      rendererConfig={updatedRendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetRendererConfig).toHaveBeenCalledWith(updatedRendererConfig);
});

test("should call render when backgroundImageBitmap changes", async () => {
  const { rerender } = customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  const initialCallCount = mockRender.mock.calls.length;

  // Create a mock ImageBitmap
  const imgEl = document.createElement("img");
  const mockImageBitmap = await createImageBitmap(imgEl);

  rerender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
      backgroundImageBitmap={mockImageBitmap}
    />,
  );

  expect(mockRender.mock.calls.length).toBeGreaterThan(initialCallCount);
  expect(mockSetBackgroundImageBitmap).toHaveBeenCalledWith(mockImageBitmap);
});

// --- Mute shortcut tests ---
test("should toggle mute when 'm' key is pressed", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  await userEvent.keyboard("m");

  expect(defaultPlayerMock.toggleMute).toHaveBeenCalled();
});

test("should reveal control panel when 'm' key is pressed", async () => {
  vi.mocked(usePlayer).mockReturnValue({
    ...defaultPlayerMock,
    isPlaying: true,
  });

  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  await userEvent.keyboard("m");

  const playerContainer = findPlayer().querySelector("[data-is-mute-revealed]");
  expect(playerContainer).toHaveAttribute("data-is-mute-revealed", "true");
});

// --- Keyboard shortcuts dialog tests ---
test("should open keyboard shortcuts dialog when '?' key is pressed", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  await userEvent.keyboard("?");

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText(/Keyboard Shortcuts/)).toBeInTheDocument();
});

// --- Keep panel visible tests ---
test("should keep panel visible when paused while panel was showing via hover", async () => {
  vi.mocked(usePlayer).mockReturnValue({
    ...defaultPlayerMock,
    isPlaying: true,
  });

  const { rerender } = customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
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
  vi.mocked(usePlayer).mockReturnValue({
    ...defaultPlayerMock,
    isPlaying: false,
  });

  rerender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  // Panel should still have keepPanelVisible true
  expect(playerContainer).toHaveAttribute("data-keep-panel-visible", "true");
});
