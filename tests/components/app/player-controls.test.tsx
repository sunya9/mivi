import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { createMockAppContext, customRender } from "tests/util";
import { expect, test, vi } from "vitest";

import {
  FpsIndicator,
  MuteButton,
  PlaybackTime,
  PlayPauseButton,
  SeekSlider,
  VolumeSlider,
} from "@/components/app/player-controls";
import { type PlaybackSnapshot } from "@/lib/player/audio-playback-store";
import { formatTime } from "@/lib/utils";
import { FpsCounter } from "@/lib/visualizer/fps-counter";

async function renderControl(ui: React.ReactNode, snapshot?: Partial<PlaybackSnapshot>) {
  const store = createMockStore({ snapshot });
  const appContextValue = createMockAppContext(store);
  await customRender(ui, { appContextValue });
  return store;
}

function getSeekSliderInput() {
  return within(screen.getByRole("group", { name: "Seek position" })).getByRole("slider", {
    hidden: true,
  });
}

test("seek slider starts a scrub on pointer down", async () => {
  const onInteractionStart = vi.fn<() => void>();
  const store = await renderControl(
    <SeekSlider onInteractionStart={onInteractionStart} onInteractionEnd={vi.fn<() => void>()} />,
  );

  fireEvent.pointerDown(screen.getByRole("group", { name: "Seek position" }));

  expect(store.beginScrub).toHaveBeenCalledOnce();
  expect(onInteractionStart).toHaveBeenCalledOnce();
});

test("seek slider seeks seamlessly on keyboard input", async () => {
  const onInteractionEnd = vi.fn<() => void>();
  const store = await renderControl(
    <SeekSlider onInteractionStart={vi.fn<() => void>()} onInteractionEnd={onInteractionEnd} />,
  );

  getSeekSliderInput().focus();
  await userEvent.keyboard("{arrowright}");

  expect(store.seek).toHaveBeenCalledWith(0.1);
  expect(store.endScrub).not.toHaveBeenCalled();
  expect(onInteractionEnd).toHaveBeenCalledOnce();
});

test("play button shows the pre-scrub state while scrubbing", async () => {
  await renderControl(<PlayPauseButton />, { status: "scrubbingPlaying" });
  expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
});

test("play button toggles playback", async () => {
  const store = await renderControl(<PlayPauseButton />);
  await userEvent.click(screen.getByRole("button", { name: "Play" }));
  expect(store.togglePlay).toHaveBeenCalledOnce();
});

test("mute button reflects and toggles mute", async () => {
  const store = await renderControl(<MuteButton />, { muted: true });
  const button = screen.getByRole("button", { name: "Unmute" });
  expect(button).toHaveAttribute("aria-pressed", "true");
  await userEvent.click(button);
  expect(store.toggleMute).toHaveBeenCalledOnce();
});

test("volume slider sets the volume and reports interaction", async () => {
  const onInteractionStart = vi.fn<() => void>();
  const onInteractionEnd = vi.fn<() => void>();
  const store = await renderControl(
    <VolumeSlider onInteractionStart={onInteractionStart} onInteractionEnd={onInteractionEnd} />,
  );

  const group = screen.getByRole("group", { name: "Volume" });
  fireEvent.pointerDown(group);
  expect(onInteractionStart).toHaveBeenCalledOnce();

  within(group).getByRole("slider", { hidden: true }).focus();
  await userEvent.keyboard("{arrowleft}");
  expect(store.setVolume).toHaveBeenLastCalledWith(0.99);
  expect(onInteractionEnd).toHaveBeenCalledOnce();
});

test("playback time shows position and duration", async () => {
  await renderControl(<PlaybackTime />, { position: 3, duration: 10 });
  expect(screen.getByText(`${formatTime(3)} / ${formatTime(10)}`)).toBeInTheDocument();
});

test("fps indicator follows the counter", async () => {
  const counter = new FpsCounter();
  await renderControl(<FpsIndicator counter={counter} />);
  expect(screen.getByText("0 fps")).toBeInTheDocument();

  // Fake timers only after render: customRender awaits async setup that real timers drive
  vi.useFakeTimers();
  try {
    act(() => {
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(21);
        counter.tick();
      }
    });
    expect(counter.getSnapshot()).toBeGreaterThan(0);
    expect(screen.getByText(`${counter.getSnapshot()} fps`)).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
