import { describe, it, expect, beforeEach, vi, test } from "vitest";
import { cn, formatTime, resetConfig, errorLogWithToast, startViewTransition } from "@/lib/utils";
import { saveValue } from "@/lib/file-db/file-db";
import { toast } from "@/components/ui/toast";

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

  it("delete all configuration", async () => {
    // store mock file
    await saveValue("test", new File([], "test"));
    localStorage.setItem("test", "test");

    const databasesBefore = await indexedDB.databases();
    expect(databasesBefore.length).toBe(1);

    await resetConfig();

    expect(location.reload).toHaveBeenCalledTimes(1);
    const databasesAfter = await indexedDB.databases();
    expect(databasesAfter.length).toBe(0);
  });
});

describe("errorLogWithToast", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should call console.error and toast.error with message", () => {
    const message = "Test error message";
    errorLogWithToast(message);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(message);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: message,
      description: undefined,
      type: "error",
    });
  });

  it("should call console.error and toast.error with message and error object", () => {
    const message = "Test error message";
    const error = new Error("Test error");
    errorLogWithToast(message, error);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(message, error);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: message,
      description: error.message,
      type: "error",
    });
  });

  it("should handle undefined error object", () => {
    const message = "Test error message";
    errorLogWithToast(message, undefined);

    expect(console.error).toHaveBeenCalledExactlyOnceWith(message);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: message,
      description: undefined,
      type: "error",
    });
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
