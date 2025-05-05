import { act, waitFor } from "@testing-library/react";
import { saveFile } from "@/lib/file-db";
import { beforeEach, expect, test, vi } from "vitest";
import {
  backgroundImageDbKey,
  useBackgroundImage,
} from "@/lib/background-image";
import { customRenderHook } from "tests/util";

beforeEach(() => {
  vi.clearAllMocks();
});

test("should initialize with empty background image", async () => {
  const { result } = customRenderHook(() => useBackgroundImage());
  await waitFor(() => {
    expect(result.current.backgroundImageFile).toBeUndefined();
    expect(result.current.backgroundImageBitmap).toBeUndefined();
  });
});

test("should load background image from IndexedDB on mount", async () => {
  const mockImage = new File(["test"], "test.png", { type: "image/png" });
  await saveFile(backgroundImageDbKey, mockImage);
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue(new ImageBitmap()),
  );
  const { result } = customRenderHook(() => useBackgroundImage());

  await waitFor(() => {
    expect(result.current.backgroundImageFile).toBeDefined();
    expect(result.current.backgroundImageBitmap).toEqual(
      expect.any(ImageBitmap),
    );
  });
});

test("should manipulate background image", async () => {
  const mockImage = new File(["test"], "test.png", { type: "image/png" });
  const { result } = customRenderHook(() => useBackgroundImage());
  await waitFor(async () => {
    await result.current.setBackgroundImageFile(mockImage);
  });

  expect(result.current.backgroundImageFile).toBe(mockImage);
  expect(result.current.backgroundImageBitmap).toEqual(expect.any(ImageBitmap));

  await act(() => result.current.setBackgroundImageFile(undefined));
  expect(result.current.backgroundImageFile).toBeUndefined();
  expect(result.current.backgroundImageBitmap).toBeUndefined();
});

test("should handle errors when loading background image", async () => {
  const mockImage = new File(["test"], "test.png", { type: "image/png" });
  console.error = vi.fn();
  const error = new Error("Failed to load image");

  await saveFile(backgroundImageDbKey, mockImage);
  vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(error));
  const { result } = customRenderHook(() => useBackgroundImage());

  await waitFor(() => {
    expect(console.error).toHaveBeenCalledWith(
      "failed to load background image",
      error,
    );
    expect(result.current.backgroundImageFile).toBeDefined();
    expect(result.current.backgroundImageBitmap).toBeUndefined();
  });
});

test("should handle errors when setting background image", async () => {
  const mockImage = new File(["test"], "test.png", { type: "image/png" });
  const error = new Error("Failed to load image");
  console.error = vi.fn();
  vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(error));

  const { result } = customRenderHook(() => useBackgroundImage());

  await waitFor(() => result.current.setBackgroundImageFile(mockImage));
  expect(console.error).toHaveBeenCalledWith(
    "failed to load background image",
    error,
  );
  expect(result.current.backgroundImageFile).toBeUndefined();
  expect(result.current.backgroundImageBitmap).toBeUndefined();
});
