import { beforeEach, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MidiVisualizer } from "@/components/app/midi-visualizer";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";
import { rendererConfig } from "tests/fixtures";
import { usePlayer } from "@/lib/player";

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
vi.mock("@/lib/player", () => ({ usePlayer: vi.fn(() => defaultPlayerMock) }));

beforeEach(() => {
  vi.resetAllMocks();
});

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

test("renders basic controls", () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  expect(screen.getByRole("slider")).toBeInTheDocument();
  expect(screen.getByText(/0:00 \/ 0:10/)).toBeInTheDocument();
});

test("handles volume control", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  const volumeButton = screen.getByRole("button", { name: "Mute" });
  await userEvent.hover(volumeButton);
  const volumeSlider = await screen.findByRole("slider", { name: "Volume" });
  await userEvent.click(volumeSlider);
  await userEvent.keyboard("{arrowleft}");

  expect(defaultPlayerMock.setVolume).toHaveBeenCalledWith(0.99);
});

test("handles seek control", async () => {
  customRender(
    <MidiVisualizer
      rendererConfig={rendererConfig}
      audioBuffer={mockAudioBuffer}
    />,
  );

  const seekSlider = screen.getByRole("slider");
  await userEvent.click(seekSlider);
  await userEvent.keyboard("{arrowright}");

  expect(defaultPlayerMock.seek).toHaveBeenCalledWith(0.1, true);
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
