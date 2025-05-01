import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { ContextType, use, useCallback, useState } from "react";
import { FileLike } from "../file-db";
import { CacheContext } from "@/contexts/files-context";

export const initialBackgroundImageCacheKey = "initial:background-image";
export const backgroundImageDbKey = "db:background-image";
function loadInitialBackgroundImage(
  cacheContext: ContextType<typeof CacheContext>,
  backgroundImageFile: FileLike | undefined,
) {
  if (!backgroundImageFile) return;
  if (cacheContext.caches.has(initialBackgroundImageCacheKey))
    return cacheContext.caches.get(initialBackgroundImageCacheKey) as
      | ImageBitmap
      | undefined;
  throw createImageBitmap(backgroundImageFile)
    .catch((error) => {
      console.error("failed to load background image", error);
      return undefined;
    })
    .then((res) => {
      cacheContext.setCache(initialBackgroundImageCacheKey, res);
      return res;
    });
}

export function useBackgroundImage() {
  const { file: backgroundImageFile, setFile } =
    useIndexedDb(backgroundImageDbKey);
  const cacheContext = use(CacheContext);
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
        } catch (error) {
          console.error("failed to load background image", error);
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
