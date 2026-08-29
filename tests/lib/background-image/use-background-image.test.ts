import { act, waitFor } from "@testing-library/react";
import { customRenderHook } from "tests/util";
import { expect, test, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { useBackgroundImage } from "@/lib/background-image/use-background-image";
import { saveValue } from "@/lib/file-db/file-db";

const mockImageBuffer = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])];
const mockImage = new File(mockImageBuffer, "test.png", { type: "image/png" });

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
  // happy-dom's createImageBitmap does not accept Blob/File sources, so stub the decode
  const bitmap = await createImageBitmap(new OffscreenCanvas(1, 1));
  vi.stubGlobal("createImageBitmap", vi.fn<typeof createImageBitmap>().mockResolvedValue(bitmap));

  const { result } = customRenderHook(() => useBackgroundImage());
  await waitFor(() => expect(result.current).not.toBeNull());
  await act(async () => await result.current.setBackgroundImageFile(mockImage));

  expect(result.current.backgroundImageFile).toBe(mockImage);
  expect(result.current.backgroundImageBitmap).toEqual(expect.any(ImageBitmap));
  expect(createImageBitmap).toHaveBeenCalledExactlyOnceWith(mockImage);

  await act(() => result.current.setBackgroundImageFile(undefined));
  expect(result.current.backgroundImageFile).toBeUndefined();
  expect(result.current.backgroundImageBitmap).toBeUndefined();
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Image file loaded",
    type: "success",
  });
});

test("should handle errors when setting background image", async () => {
  const error = new Error("Failed to load image");
  console.error = vi.fn<(...data: unknown[]) => void>();
  vi.stubGlobal("createImageBitmap", vi.fn<typeof createImageBitmap>().mockRejectedValue(error));

  const { result } = customRenderHook(() => useBackgroundImage());

  await waitFor(() => expect(result.current).not.toBeNull());
  await act(async () => await result.current.setBackgroundImageFile(mockImage));
  await waitFor(() => {
    expect(console.error).toHaveBeenCalledExactlyOnceWith("Failed to load background image", error);
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      title: "Failed to load background image",
      description: error.message,
      type: "error",
    });
  });
  // Decode failed, so entry is NOT saved
  expect(result.current.backgroundImageFile).toBeUndefined();
  expect(result.current.backgroundImageBitmap).toBeUndefined();
});
