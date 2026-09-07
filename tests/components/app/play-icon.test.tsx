import { act } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { audioBuffer } from "tests/fixtures";
import { createMockStore } from "tests/lib/player/create-mock-store";
import { createMockAppContext, customRender } from "tests/util";
import { expect, test } from "vitest";

import { PlayIcon } from "@/components/app/play-icon";
import { createAppContext } from "@/contexts/app-context";
import { type PlaybackSnapshot } from "@/lib/player/audio-playback-store";

async function renderWithSnapshot(snapshot: Partial<PlaybackSnapshot>) {
  const appContextValue = createMockAppContext(createMockStore({ snapshot }));
  return customRender(<PlayIcon />, { appContextValue });
}

test("renders nothing before playback has ever started", async () => {
  const { container } = await renderWithSnapshot({ status: "initial" });
  expect(container).toBeEmptyDOMElement();
});

test("shows the play feedback right after playback starts", async () => {
  const { container } = await renderWithSnapshot({
    status: "playing",
    playFeedbackAt: performance.now(),
  });
  expect(container.firstElementChild).toHaveAttribute("data-state", "playing");
});

test("shows the pause feedback right after playback stops", async () => {
  const { container } = await renderWithSnapshot({
    status: "paused",
    playFeedbackAt: performance.now(),
  });
  expect(container.firstElementChild).toHaveAttribute("data-state", "paused");
});

test("renders nothing once the feedback has expired", async () => {
  const { container } = await renderWithSnapshot({ status: "playing", playFeedbackAt: 0 });
  expect(container).toBeEmptyDOMElement();
});

test("keeps showing the pre-scrub state while scrubbing", async () => {
  const { container } = await renderWithSnapshot({
    status: "scrubbingPlaying",
    playFeedbackAt: performance.now(),
  });
  expect(container.firstElementChild).toHaveAttribute("data-state", "playing");
});

test("remounts the feedback on each toggle to retrigger the animation", async () => {
  const appContextValue = createAppContext(new AudioContext());
  const { container } = await customRender(<PlayIcon />, { appContextValue });
  // The providers bind the (empty) audio entry on mount, so load the buffer afterwards
  act(() => appContextValue.audioPlaybackStore.setAudioBuffer(audioBuffer));

  act(() => appContextValue.audioPlaybackStore.togglePlay());
  const first = container.firstElementChild;
  expect(first).not.toBeNull();

  act(() => appContextValue.audioPlaybackStore.togglePlay());
  const second = container.firstElementChild;
  expect(second).not.toBeNull();
  expect(second).not.toBe(first);
  expect(container.firstElementChild).toHaveAttribute("data-state", "paused");
});
