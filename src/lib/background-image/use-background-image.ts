import { useBackgroundImageFileDb } from "@/lib/file-db/file-db-store";
import { useCallback } from "react";
import { toast } from "sonner";
import { errorLogWithToast } from "../utils";

export function useBackgroundImage() {
  const {
    file: backgroundImageFile,
    decoded: backgroundImageBitmap,
    setEntry,
  } = useBackgroundImageFileDb();

  const setBackgroundImageFile = useCallback(
    async (newFile: File | undefined) => {
      if (!newFile) {
        await setEntry(undefined);
        return;
      }
      try {
        const bitmap = await createImageBitmap(newFile);
        await setEntry({ file: newFile, decoded: bitmap });
        toast.success("Image file loaded");
      } catch (error) {
        errorLogWithToast("Failed to load background image", error);
      }
    },
    [setEntry],
  );

  return {
    backgroundImageBitmap,
    setBackgroundImageFile,
    backgroundImageFile,
  };
}
