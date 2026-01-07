import { afterEach, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";
import { rendererConfig } from "tests/fixtures";
import { usePlayer } from "@/lib/player/use-player";

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
