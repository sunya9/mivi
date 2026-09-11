import { act, waitFor } from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";
import { customRenderHook } from "tests/util";
import { afterEach, expect, test, vi } from "vitest";

import { toast } from "@/components/ui/toast";
import { createAppContext } from "@/contexts/app-context";
import { fileDecoders } from "@/contexts/file-decoders";
import {
  useBackgroundImage,
  useSetBackgroundImageFile,
} from "@/lib/background-image/use-background-image";
import { RendererController } from "@/lib/renderers/renderer-controller";

// The engine paints as soon as an entry appears; the stand-in bitmaps below are not drawable
vi.spyOn(RendererController.prototype, "render").mockImplementation(() => {});

vi.mock("@/contexts/file-decoders", { spy: true });

afterEach(() => vi.unstubAllGlobals());

const mockImageBuffer = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])];
const mockImage = new File(mockImageBuffer, "test.png", { type: "image/png" });

test("should manipulate background image", async () => {
  // happy-dom's createImageBitmap does not accept Blob/File sources, so stub the decode
  const bitmap = await createImageBitmap(new OffscreenCanvas(1, 1));
  vi.stubGlobal("createImageBitmap", vi.fn<typeof createImageBitmap>().mockResolvedValue(bitmap));

  const { result } = await customRenderHook(() => useBackgroundImage());
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

test("useSetBackgroundImageFile does not re-render when the image changes", async () => {
  const bitmap = await createImageBitmap(new OffscreenCanvas(1, 1));
  vi.mocked(fileDecoders.backgroundImage).mockResolvedValueOnce(bitmap);
  const appContextValue = createAppContext(new AudioContext());
  let renders = 0;
  const { result } = await customRenderHook(
    () => {
      renders++;
      return useSetBackgroundImageFile();
    },
    { appContextValue },
  );
  const rendersAfterMount = renders;

  await act(() => result.current(mockImage));

  expect(appContextValue.fileStore.backgroundImage.getSnapshot().decoded).toBe(bitmap);
  expect(renders).toBe(rendersAfterMount);
  expect(toast.add).toHaveBeenCalledExactlyOnceWith({
    title: "Image file loaded",
    type: "success",
  });
});
