import { registrar, AudioContext } from "standardized-audio-context-mock";
import { audioBuffer } from "tests/fixtures";
import { expect, test, vi } from "vitest";

import { AudioAnalyzer } from "@/lib/audio/audio-analyzer";
import { AudioPlaybackStoreImpl, PLAY_FEEDBACK_MS } from "@/lib/player/audio-playback-store";

function createStore() {
  const audioContext = new AudioContext();
  const store = new AudioPlaybackStoreImpl(audioContext);
  return { store, audioContext };
}

function createStoreWithAudioBuffer() {
  const { store, audioContext } = createStore();
  store.setAudioBuffer(audioBuffer);
  return { store, audioContext };
}

// Helper to get AudioBufferSourceNodes from registrar
function getSourceNodes(audioContext: AudioContext) {
  return registrar.getAudioNodes(audioContext, "AudioBufferSourceNode");
}

test("should initialize with default values", () => {
  const { store } = createStoreWithAudioBuffer();
  const snapshot = store.getSnapshot();

  expect(snapshot.status).toBe("initial");
  expect(snapshot.playFeedbackAt).toBe(0);
  expect(snapshot.volume).toBe(1);
  expect(snapshot.muted).toBe(false);
  expect(snapshot.position).toBe(0);
  expect(snapshot.duration).toBe(audioBuffer.duration);
});

test("should toggle play/pause state", () => {
  const { store } = createStoreWithAudioBuffer();

  expect(store.getSnapshot().status).toBe("initial");
  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");
  store.togglePlay();
  expect(store.getSnapshot().status).toBe("paused");
});

test("togglePlay raises play feedback that expires on its own", () => {
  vi.useFakeTimers();
  try {
    const { store } = createStoreWithAudioBuffer();
    const before = performance.now();

    store.togglePlay();
    const first = store.getSnapshot().playFeedbackAt;
    expect(first).toBeGreaterThanOrEqual(before);

    vi.advanceTimersByTime(PLAY_FEEDBACK_MS);
    expect(store.getSnapshot().playFeedbackAt).toBe(0);
    expect(store.getSnapshot().status).toBe("playing");
  } finally {
    vi.useRealTimers();
  }
});

test("a second toggle restarts the feedback", () => {
  vi.useFakeTimers();
  try {
    const { store } = createStoreWithAudioBuffer();
    store.togglePlay();
    const first = store.getSnapshot().playFeedbackAt;

    vi.advanceTimersByTime(PLAY_FEEDBACK_MS / 2);
    store.togglePlay();
    const second = store.getSnapshot().playFeedbackAt;
    expect(second).toBeGreaterThan(first);

    vi.advanceTimersByTime(PLAY_FEEDBACK_MS / 2);
    expect(store.getSnapshot().playFeedbackAt).toBe(second);
  } finally {
    vi.useRealTimers();
  }
});

test("seek and scrub do not raise play feedback", () => {
  const { store } = createStoreWithAudioBuffer();
  store.togglePlay();
  const feedbackAt = store.getSnapshot().playFeedbackAt;

  store.seek(5);
  store.beginScrub();
  store.endScrub(6);

  expect(store.getSnapshot().playFeedbackAt).toBe(feedbackAt);
  expect(store.getSnapshot().status).toBe("playing");
});

test("a new audio buffer returns to the initial status", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();
  store.togglePlay();
  store.togglePlay();
  expect(store.getSnapshot().status).toBe("paused");

  store.setAudioBuffer(audioContext.createBuffer(1, 44100, 44100));

  expect(store.getSnapshot().status).toBe("initial");
  expect(store.getSnapshot().playFeedbackAt).toBe(0);
});

test("should handle seeking", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(50);
  expect(store.getSnapshot().position).toBe(50);
});

test("should handle volume changes", () => {
  const { store } = createStoreWithAudioBuffer();

  store.setVolume(0.5);
  expect(store.getSnapshot().volume).toBe(0.5);
});

test("should handle mute toggle", () => {
  const { store } = createStoreWithAudioBuffer();

  store.toggleMute();
  expect(store.getSnapshot().muted).toBe(true);
});

test("should reset playback time when audioBuffer becomes undefined", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(50);
  expect(store.getSnapshot().position).toBe(50);
  expect(store.getSnapshot().position).toBe(50);

  store.setAudioBuffer(undefined);
  expect(store.getSnapshot().position).toBe(0);
  expect(store.getSnapshot().position).toBe(0);
});

test("should stop playing and reset when audioBuffer becomes undefined during playback", () => {
  const { store } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");
  store.seek(30);

  store.setAudioBuffer(undefined);
  expect(store.getSnapshot().status).toBe("initial");
  expect(store.getSnapshot().position).toBe(0);
});

test("should snap seek time to 0 when time is less than 1 second", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(0.5);
  expect(store.getSnapshot().position).toBe(0);
  expect(store.getSnapshot().position).toBe(0);
});

test("should not snap seek time when time is 1 second or more", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(1);
  expect(store.getSnapshot().position).toBe(1);
  expect(store.getSnapshot().position).toBe(1);
});

test("should keep playing across a seek", () => {
  const { store } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");

  store.seek(30);
  expect(store.getSnapshot().status).toBe("playing");
  expect(store.getSnapshot().position).toBe(30);
});

test("should stay stopped across a seek", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(30);
  expect(store.getSnapshot().position).toBe(30);
  expect(store.getSnapshot().status).toBe("initial");
});

test("beginScrub pauses playback and remembers to resume", () => {
  const { store } = createStoreWithAudioBuffer();
  store.togglePlay();

  store.beginScrub();

  expect(store.getSnapshot().status).toBe("scrubbingPlaying");
});

test("scrub moves the position without resuming", () => {
  const { store } = createStoreWithAudioBuffer();
  store.togglePlay();
  store.beginScrub();

  store.scrub(30);

  expect(store.getSnapshot().position).toBe(30);
  expect(store.getSnapshot().status).toBe("scrubbingPlaying");
});

test("endScrub commits the position and resumes playback", () => {
  const { store } = createStoreWithAudioBuffer();
  store.togglePlay();
  store.beginScrub();
  store.scrub(20);

  store.endScrub(30);

  expect(store.getSnapshot().position).toBe(30);
  expect(store.getSnapshot().status).toBe("playing");
});

test("endScrub stays stopped when scrubbing started while stopped", () => {
  const { store } = createStoreWithAudioBuffer();

  store.beginScrub();
  expect(store.getSnapshot().status).toBe("scrubbingPaused");

  store.endScrub(30);

  expect(store.getSnapshot().position).toBe(30);
  expect(store.getSnapshot().status).toBe("initial");
});

test("scrub snaps to the start like seek", () => {
  const { store } = createStoreWithAudioBuffer();
  store.beginScrub();

  store.scrub(0.5);
  expect(store.getSnapshot().position).toBe(0);

  store.endScrub(0.5);
  expect(store.getSnapshot().position).toBe(0);
});

test("beginScrub twice keeps the original resume decision", () => {
  const { store } = createStoreWithAudioBuffer();
  store.togglePlay();

  store.beginScrub();
  store.beginScrub();

  expect(store.getSnapshot().status).toBe("scrubbingPlaying");
});

test("should do nothing when play is called without audioBuffer", () => {
  const { store } = createStore();

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("initial");
});

test("should create and stop source when pausing", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");
  expect(getSourceNodes(audioContext).length).toBe(1);

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("paused");
});

test("should transition to paused state when ended event fires", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");

  const sourceNodes = getSourceNodes(audioContext);
  expect(sourceNodes.length).toBe(1);

  sourceNodes[0].dispatchEvent(new Event("ended"));
  expect(store.getSnapshot().status).toBe("paused");
  expect(store.getSnapshot().position).toBe(audioBuffer.duration);
});

test("should not transition to paused when ended fires on old source after manual stop", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();

  store.togglePlay();
  const firstSource = getSourceNodes(audioContext)[0];

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("paused");

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");

  // Old source's ended event should be ignored
  firstSource.dispatchEvent(new Event("ended"));
  expect(store.getSnapshot().status).toBe("playing");
});

test("should update position when syncFromAudioContext is called during playback", async () => {
  const { store, audioContext } = createStore();
  // Use a long buffer so travel(5) doesn't trigger the ended event
  const longBuffer = audioContext.createBuffer(1, 44100 * 10, 44100);
  store.setAudioBuffer(longBuffer);

  store.togglePlay();
  expect(store.getSnapshot().status).toBe("playing");
  expect(store.getSnapshot().position).toBe(0);

  // Advance mock AudioContext time via DeLorean
  const deLorean = registrar.getDeLorean(audioContext)!;
  await deLorean.travel(5);

  store.syncFromAudioContext();
  expect(store.getSnapshot().position).toBe(5);
});

test("should notify subscribers on state changes", () => {
  const { store } = createStoreWithAudioBuffer();
  const listener = vi.fn<() => void>();
  store.subscribe(listener);

  store.togglePlay();
  expect(listener).toHaveBeenCalled();
});

test("should unsubscribe correctly", () => {
  const { store } = createStoreWithAudioBuffer();
  const listener = vi.fn<() => void>();
  const unsubscribe = store.subscribe(listener);

  unsubscribe();
  store.togglePlay();
  expect(listener).not.toHaveBeenCalled();
});

test("persists volume and mute under the existing keys", () => {
  const { store } = createStoreWithAudioBuffer();

  store.setVolume(0.4);
  store.toggleMute();

  expect(localStorage.getItem("mivi:volume")).toBe("0.4");
  expect(localStorage.getItem("mivi:muted")).toBe("true");
  expect(createStore().store.getSnapshot()).toMatchObject({ volume: 0.4, muted: true });
});

test("configureAnalyser applies fft size and smoothing to the live analyser", () => {
  // The mocked AnalyserNode does not derive bin counts, so observe the wrapper's setters
  const setFftSize = vi.spyOn(AudioAnalyzer.prototype, "fftSize", "set");
  const setSmoothing = vi.spyOn(AudioAnalyzer.prototype, "smoothingTimeConstant", "set");
  const { store } = createStoreWithAudioBuffer();

  store.configureAnalyser({ fftSize: 512, smoothingTimeConstant: 0.2 });

  expect(setFftSize).toHaveBeenCalledWith(512);
  expect(setSmoothing).toHaveBeenCalledWith(0.2);
});
