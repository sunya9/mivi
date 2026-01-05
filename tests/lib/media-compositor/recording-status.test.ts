import { describe, it, expect } from "vitest";
import {
  ReadyState,
  RecordingState,
} from "@/lib/media-compositor/recording-status";

describe("ReadyState", () => {
  it("should have type 'ready'", () => {
    const state = new ReadyState();
    expect(state.type).toBe("ready");
  });

  it("should have isRecording set to false", () => {
    const state = new ReadyState();
    expect(state.isRecording).toBe(false);
  });
});

describe("RecordingState", () => {
  it("should have type 'recording'", () => {
    const state = new RecordingState(0.5);
    expect(state.type).toBe("recording");
  });

  it("should have isRecording set to true", () => {
    const state = new RecordingState(0.5);
    expect(state.isRecording).toBe(true);
  });

  it("should store progress value", () => {
    const state = new RecordingState(0.75);
    expect(state.progress).toBe(0.75);
  });

  it("should handle progress at 0", () => {
    const state = new RecordingState(0);
    expect(state.progress).toBe(0);
  });

  it("should handle progress at 1", () => {
    const state = new RecordingState(1);
    expect(state.progress).toBe(1);
  });
});

describe("RecordingStatus type discrimination", () => {
  it("should be able to discriminate ReadyState by type", () => {
    const state = new ReadyState();

    expect(state.type).toBe("ready");
    expect(state.isRecording).toBe(false);
  });

  it("should be able to discriminate RecordingState by type", () => {
    const state = new RecordingState(0.5);

    expect(state.type).toBe("recording");
    expect(state.progress).toBe(0.5);
  });
});
