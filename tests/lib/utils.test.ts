import { testMidiTracks } from "tests/fixtures";
import { describe, it, expect, beforeEach, vi, test } from "vitest";

import { FileStore } from "@/lib/file-store/file-store";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { cn, formatTime, resetConfig, startViewTransition } from "@/lib/utils";

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

describe("resetConfig", () => {
  beforeEach(() => {
    vi.spyOn(location, "reload");
  });

  it("clears stored files and localStorage, then reloads", async () => {
    const storage = new MemoryFileStorage();
    await storage.write("audio", new File([], "test"));
    const fileStore = new FileStore(storage, {
      midi: async () => testMidiTracks,
      audio: async () => {
        throw new Error("unused");
      },
      backgroundImage: async () => {
        throw new Error("unused");
      },
    });
    localStorage.setItem("test", "test");

    await resetConfig(fileStore);

    expect(await storage.read("audio")).toBeUndefined();
    expect(localStorage.getItem("test")).toBeNull();
    expect(location.reload).toHaveBeenCalledTimes(1);
  });
});

describe("startViewTransition", () => {
  function setupStartViewTransition() {
    document.startViewTransition = vi.fn<Document["startViewTransition"]>();
    const callback = vi.fn<() => void>();
    return { callback };
  }

  test("calls document.startViewTransition when available", () => {
    const { callback } = setupStartViewTransition();

    startViewTransition(callback);

    expect(document.startViewTransition).toHaveBeenCalledOnce();
    const arg = vi.mocked(document.startViewTransition).mock.calls[0][0] as {
      update: () => void;
    };
    arg.update();
    expect(callback).toHaveBeenCalledExactlyOnceWith();
  });

  test("passes types option to startViewTransition", () => {
    const { callback } = setupStartViewTransition();

    startViewTransition(callback, { types: ["my-transition"] });

    expect(document.startViewTransition).toHaveBeenCalledOnce();
    const arg = vi.mocked(document.startViewTransition).mock.calls[0][0] as {
      update: () => void;
      types: string[];
    };
    expect(arg.types).toEqual(["my-transition"]);
    arg.update();
    expect(callback).toHaveBeenCalledExactlyOnceWith();
  });

  test("calls callback directly when startViewTransition is not available", () => {
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      writable: true,
    });
    const callback = vi.fn<() => void>();

    startViewTransition(callback);

    expect(callback).toHaveBeenCalledExactlyOnceWith();
  });
});
