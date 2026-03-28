import { expect, test, vi } from "vitest";
import { audioBuffer } from "tests/fixtures";
import { registrar, AudioContext } from "standardized-audio-context-mock";
import { AudioPlaybackStoreImpl } from "@/lib/player/audio-playback-store";
import { LocalStorageRepository } from "@/lib/storage/storage-repository";

function createStore() {
  const audioContext = new AudioContext();
  const store = new AudioPlaybackStoreImpl(audioContext, new LocalStorageRepository());
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

  expect(snapshot.isPlaying).toBe(false);
  expect(snapshot.volume).toBe(1);
  expect(snapshot.muted).toBe(false);
  expect(snapshot.position).toBe(0);
  expect(snapshot.duration).toBe(audioBuffer.duration);
});

test("should toggle play/pause state", () => {
  const { store } = createStoreWithAudioBuffer();

  expect(store.getSnapshot().isPlaying).toBe(false);
  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);
  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(false);
});

test("should handle seeking", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(50, true);
  expect(store.getPosition()).toBe(50);
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

  store.seek(50, true);
  expect(store.getPosition()).toBe(50);
  expect(store.getSnapshot().position).toBe(50);

  store.setAudioBuffer(undefined);
  expect(store.getPosition()).toBe(0);
  expect(store.getSnapshot().position).toBe(0);
});

test("should stop playing and reset when audioBuffer becomes undefined during playback", () => {
  const { store } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);
  store.seek(30, true);

  store.setAudioBuffer(undefined);
  expect(store.getSnapshot().isPlaying).toBe(false);
  expect(store.getPosition()).toBe(0);
  expect(store.getSnapshot().position).toBe(0);
});

test("should snap seek time to 0 when time is less than 1 second", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(0.5, true);
  expect(store.getPosition()).toBe(0);
  expect(store.getSnapshot().position).toBe(0);
});

test("should not snap seek time when time is 1 second or more", () => {
  const { store } = createStoreWithAudioBuffer();

  store.seek(1, true);
  expect(store.getPosition()).toBe(1);
  expect(store.getSnapshot().position).toBe(1);
});

test("should maintain playing state during seamless seek", () => {
  const { store } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);

  store.seek(30, true, true);
  expect(store.getSnapshot().isPlaying).toBe(true);
  expect(store.getSnapshot().position).toBe(30);
});

test("should enter seeking state without committing when commit is false", () => {
  const { store } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);

  store.seek(30, false);
  expect(store.getSnapshot().isPlaying).toBe(false);
});

test("should update position when seeking from paused state", () => {
  const { store } = createStoreWithAudioBuffer();

  expect(store.getSnapshot().isPlaying).toBe(false);
  store.seek(30, false);
  expect(store.getSnapshot().position).toBe(30);
  expect(store.getSnapshot().isPlaying).toBe(false);
});

test("should not resume playing after seek commit when was paused", () => {
  const { store } = createStoreWithAudioBuffer();

  expect(store.getSnapshot().isPlaying).toBe(false);
  store.seek(30, true);
  expect(store.getSnapshot().isPlaying).toBe(false);
  expect(store.getSnapshot().position).toBe(30);
});

test("should do nothing when play is called without audioBuffer", () => {
  const { store } = createStore();

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(false);
});

test("should create and stop source when pausing", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);
  expect(getSourceNodes(audioContext).length).toBe(1);

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(false);
});

test("should transition to paused state when ended event fires", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);

  const sourceNodes = getSourceNodes(audioContext);
  expect(sourceNodes.length).toBe(1);

  sourceNodes[0].dispatchEvent(new Event("ended"));
  expect(store.getSnapshot().isPlaying).toBe(false);
  expect(store.getSnapshot().position).toBe(audioBuffer.duration);
});

test("should not transition to paused when ended fires on old source after manual stop", () => {
  const { store, audioContext } = createStoreWithAudioBuffer();

  store.togglePlay();
  const firstSource = getSourceNodes(audioContext)[0];

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(false);

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);

  // Old source's ended event should be ignored
  firstSource.dispatchEvent(new Event("ended"));
  expect(store.getSnapshot().isPlaying).toBe(true);
});

test("should update position when syncFromAudioContext is called during playback", async () => {
  const { store, audioContext } = createStore();
  // Use a long buffer so travel(5) doesn't trigger the ended event
  const longBuffer = audioContext.createBuffer(1, 44100 * 10, 44100);
  store.setAudioBuffer(longBuffer);

  store.togglePlay();
  expect(store.getSnapshot().isPlaying).toBe(true);
  expect(store.getSnapshot().position).toBe(0);

  // Advance mock AudioContext time via DeLorean
  const deLorean = registrar.getDeLorean(audioContext)!;
  await deLorean.travel(5);

  store.syncFromAudioContext();
  expect(store.getSnapshot().position).toBe(5);
});

test("should notify subscribers on state changes", () => {
  const { store } = createStoreWithAudioBuffer();
  const listener = vi.fn();
  store.subscribe(listener);

  store.togglePlay();
  expect(listener).toHaveBeenCalled();
});

test("should unsubscribe correctly", () => {
  const { store } = createStoreWithAudioBuffer();
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);

  unsubscribe();
  store.togglePlay();
  expect(listener).not.toHaveBeenCalled();
});
