import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { useCallback, useState } from "react";
import { FileLike } from "../file-db";

async function loadBackgroundImage(backgroundImageFile: FileLike) {
  return createImageBitmap(backgroundImageFile);
}

let cachedInitialBackgroundImage: ImageBitmap | undefined;

function loadInitialBackgroundImage(backgroundImageFile: FileLike | undefined) {
  if (!backgroundImageFile) return;
  if (cachedInitialBackgroundImage) return cachedInitialBackgroundImage;
  throw loadBackgroundImage(backgroundImageFile).then((res) => {
    cachedInitialBackgroundImage = res;
    return res;
  });
}

export function useBackgroundImage() {
  const { file: backgroundImageFile, setFile } =
    useIndexedDb("background-image");
  const [backgroundImageBitmap, setBackgroundImageBitmapInternal] = useState(
    () => loadInitialBackgroundImage(backgroundImageFile),
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
          const imageBitmap = await loadBackgroundImage(newFile);
          setBackgroundImageBitmap(imageBitmap);
        } catch (error) {
          console.error("failed to load background image", error);
        }
      } else {
        setBackgroundImageBitmap(undefined);
      }
      await setFile(newFile);
    },
    [setFile],
  );

  return {
    backgroundImageBitmap,
    setBackgroundImageFile,
    backgroundImageFile,
  };
}
