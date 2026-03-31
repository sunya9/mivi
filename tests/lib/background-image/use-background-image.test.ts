import { act, waitFor } from "@testing-library/react";
import { saveValue } from "@/lib/file-db/file-db";
import { expect, test, vi } from "vitest";
import { useBackgroundImage } from "@/lib/background-image/use-background-image";
import { customRenderHook } from "tests/util";
import { toast } from "sonner";

const mockImage = new File(["test"], "test.png", { type: "image/png" });

test("should initialize with empty background image", async () => {
  const { result } = customRenderHook(() => useBackgroundImage());
  await waitFor(() => {
    expect(result.current.backgroundImageFile).toBeUndefined();
    expect(result.current.backgroundImageBitmap).toBeUndefined();
  });
});

test("should load background image from IndexedDB on mount", async () => {
  // Store entry with a plain object as decoded value
  // (fake-indexeddb can't structured-clone the mocked ImageBitmap)
  const entry = {
    file: mockImage,
    decoded: { width: 100, height: 100 },
  };
  await saveValue("db:background-image", entry);
  const { result } = customRenderHook(() => useBackgroundImage());

  await waitFor(() => {
    expect(result.current.backgroundImageFile).toBeDefined();
    expect(result.current.backgroundImageBitmap).toBeDefined();
  });
});

test("should manipulate background image", async () => {
  const { result } = customRenderHook(() => useBackgroundImage());
  await waitFor(async () => {
    await result.current.setBackgroundImageFile(mockImage);
  });

  expect(result.current.backgroundImageFile).toBe(mockImage);
  expect(result.current.backgroundImageBitmap).toEqual(expect.any(ImageBitmap));

  await act(() => result.current.setBackgroundImageFile(undefined));
  expect(result.current.backgroundImageFile).toBeUndefined();
  expect(result.current.backgroundImageBitmap).toBeUndefined();
  expect(toast.success).toHaveBeenCalledExactlyOnceWith("Image file loaded");
});

test("should handle errors when setting background image", async () => {
  const error = new Error("Failed to load image");
  console.error = vi.fn();
  vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(error));

  const { result } = customRenderHook(() => useBackgroundImage());

  await waitFor(() => result.current.setBackgroundImageFile(mockImage));
  await waitFor(() => {
    expect(console.error).toHaveBeenCalledExactlyOnceWith("Failed to load background image", error);
    expect(toast.error).toHaveBeenCalledExactlyOnceWith("Failed to load background image", {
      description: error.message,
    });
  });
  // Decode failed, so entry is NOT saved
  expect(result.current.backgroundImageFile).toBeUndefined();
  expect(result.current.backgroundImageBitmap).toBeUndefined();
});
