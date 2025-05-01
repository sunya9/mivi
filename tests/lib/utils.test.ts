import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  cn,
  formatTime,
  getRendererFromConfig,
  resetConfig,
} from "@/lib/utils";
import {
  RendererContext,
  RendererConfig,
  resolutions,
} from "@/lib/renderers/renderer";
import { PianoRollRenderer } from "@/lib/renderers/piano-roll-renderer";
import { saveFile } from "@/lib/file-db/file-db";

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", null, undefined, "class2")).toBe("class1 class2");
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
  });
});

describe("formatTime", () => {
  it("should format time correctly", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(59)).toBe("0:59");
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(3599)).toBe("59:59");
  });
});

describe("getRendererFromConfig", () => {
  const canvas = document.createElement("canvas");
  const mockContext: RendererContext = canvas.getContext("2d")!;

  const mockConfig: RendererConfig = {
    type: "pianoRoll",
    backgroundColor: "#000000",
    backgroundImageUrl: "",
    backgroundImageFit: "cover",
    backgroundImagePosition: "center",
    backgroundImageRepeat: "no-repeat",
    backgroundImageOpacity: 1,
    resolution: resolutions[0],
    fps: 60,
    format: "mp4",
    pianoRollConfig: {
      noteMargin: 2,
      noteVerticalMargin: 1,
      gridColor: "#ffffff",
      showRippleEffect: true,
      showPlayhead: true,
      playheadPosition: 20,
      playheadColor: "#ff4081",
      playheadOpacity: 1,
      playheadWidth: 2,
      noteHeight: 4,
      noteCornerRadius: 2,
      timeWindow: 5,
      showNoteFlash: true,
      noteFlashDuration: 1,
      noteFlashIntensity: 1,
      viewRangeTop: 0,
      viewRangeBottom: 127,
      showNotePressEffect: true,
      notePressDepth: 1,
      rippleDuration: 1,
      rippleRadius: 1,
      useCustomRippleColor: false,
      rippleColor: "#ff4081",
      noteFlashMode: "on",
      noteFlashFadeOutDuration: 1,
      pressAnimationDuration: 1,
    },
  };

  it("should return PianoRollRenderer for pianoRoll type", () => {
    const config: RendererConfig = { ...mockConfig, type: "pianoRoll" };
    const renderer = getRendererFromConfig(mockContext, config);
    expect(renderer).toBeInstanceOf(PianoRollRenderer);
  });

  it("should throw error for unknown renderer type", () => {
    const config = {
      ...mockConfig,
      type: "unknown",
    } as unknown as RendererConfig;
    expect(() => getRendererFromConfig(mockContext, config)).toThrow(
      "Unknown renderer type",
    );
  });
});

describe("resetConfig", () => {
  beforeEach(() => {
    vi.spyOn(location, "reload");
  });

  it("delete all configuration", async () => {
    // store mock file
    await saveFile("test", new File([], "test"));
    localStorage.setItem("test", "test");

    const databasesBefore = await indexedDB.databases();
    expect(databasesBefore.length).toBe(1);

    await resetConfig();

    expect(location.reload).toHaveBeenCalledTimes(1);
    const databasesAfter = await indexedDB.databases();
    expect(databasesAfter.length).toBe(0);
  });
});
