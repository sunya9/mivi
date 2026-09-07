import { AudioContext } from "standardized-audio-context-mock";
import { afterEach, expect, test, vi } from "vitest";

import type { PlaybackStatus } from "@/lib/player/audio-playback-store";
import { bindPageLifecycle } from "@/lib/player/bind-page-lifecycle";

import { createMockStore } from "./create-mock-store";

let unbind: (() => void) | undefined;

afterEach(() => {
  unbind?.();
  unbind = undefined;
});

function pageShow(persisted: boolean) {
  const event = new PageTransitionEvent("pageshow");
  Object.defineProperty(event, "persisted", { value: persisted });
  window.dispatchEvent(event);
}

function setup(state: "running" | "suspended" = "running", status: PlaybackStatus = "paused") {
  const playback = createMockStore({ snapshot: { status } });
  const audioContext = new AudioContext();
  if (state === "running") void audioContext.resume();
  const resume = vi.spyOn(audioContext, "resume");
  unbind = bindPageLifecycle(playback, audioContext);
  return { playback, audioContext, resume };
}

test("pagehide pauses playback", () => {
  const { playback } = setup();

  window.dispatchEvent(new PageTransitionEvent("pagehide"));

  expect(playback.pause).toHaveBeenCalledOnce();
});

test("restoring from bfcache resumes a context that the browser suspended meanwhile", () => {
  const { audioContext, resume } = setup();

  window.dispatchEvent(new PageTransitionEvent("pagehide"));
  void audioContext.suspend();
  pageShow(true);

  expect(resume).toHaveBeenCalledOnce();
});

test("restoring does not resume a context that was already suspended before leaving", () => {
  const { resume } = setup("suspended");

  window.dispatchEvent(new PageTransitionEvent("pagehide"));
  pageShow(true);

  expect(resume).not.toHaveBeenCalled();
});

test("restoring from bfcache restarts playback that pagehide interrupted", () => {
  const { playback } = setup("running", "playing");

  window.dispatchEvent(new PageTransitionEvent("pagehide"));
  pageShow(true);

  expect(playback.play).toHaveBeenCalledOnce();
});

test("a scrub that was going to resume also restarts on restore", () => {
  const { playback } = setup("running", "scrubbingPlaying");

  window.dispatchEvent(new PageTransitionEvent("pagehide"));
  pageShow(true);

  expect(playback.play).toHaveBeenCalledOnce();
});

test("restoring leaves playback alone when it was paused before leaving", () => {
  const { playback } = setup("running", "paused");

  window.dispatchEvent(new PageTransitionEvent("pagehide"));
  pageShow(true);

  expect(playback.play).not.toHaveBeenCalled();
});

test("a fresh page load does not touch the context or playback", () => {
  const { playback, resume } = setup("running", "playing");

  pageShow(false);

  expect(resume).not.toHaveBeenCalled();
  expect(playback.play).not.toHaveBeenCalled();
});

test("unbind detaches the listeners", () => {
  const { playback } = setup();

  unbind?.();
  unbind = undefined;
  window.dispatchEvent(new PageTransitionEvent("pagehide"));

  expect(playback.pause).not.toHaveBeenCalled();
});
