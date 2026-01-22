import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { useCallback, useState } from "react";
import { CacheContextValue, useCacheContext } from "@/lib/cache/cache-context";
import { toast } from "sonner";
import { errorLogWithToast } from "../utils";

const initialBackgroundImageCacheKey = "initial:background-image";
export const backgroundImageDbKey = "db:background-image";
function loadInitialBackgroundImage(
  cacheContext: CacheContextValue,
  backgroundImageFile: File | undefined,
) {
  if (!backgroundImageFile) return;
  if (cacheContext.caches.has(initialBackgroundImageCacheKey))
    return cacheContext.caches.get(initialBackgroundImageCacheKey) as
      | ImageBitmap
      | undefined;
  throw createImageBitmap(backgroundImageFile)
    .catch((error) => {
      console.error("Failed to load background image", error);
    })
    .then((res) => {
      cacheContext.setCache(initialBackgroundImageCacheKey, res);
      return res;
    });
}

export function useBackgroundImage() {
  const { file: backgroundImageFile, setFile } =
    useIndexedDb(backgroundImageDbKey);
  const cacheContext = useCacheContext();
  const [backgroundImageBitmap, setBackgroundImageBitmapInternal] = useState(
    () => loadInitialBackgroundImage(cacheContext, backgroundImageFile),
  );
  const setBackgroundImageBitmap = (imageBitmap: ImageBitmap | undefined) => {
    setBackgroundImageBitmapInternal((prev) => {
      prev?.close();
      return imageBitmap;
    });
  };

  const setBackgroundImageFile = useCallback(
    async (newFile: File | undefined) => {
      if (newFile) {
        try {
          const imageBitmap = await createImageBitmap(newFile);
          setBackgroundImageBitmap(imageBitmap);
          await setFile(newFile);
          toast.success("Image file loaded");
        } catch (error) {
          errorLogWithToast("Failed to load background image", error);
        }
      } else {
        setBackgroundImageBitmap(undefined);
        await setFile(undefined);
      }
    },
    [setFile],
  );

  return {
    backgroundImageBitmap,
    setBackgroundImageFile,
    backgroundImageFile,
  };
}
