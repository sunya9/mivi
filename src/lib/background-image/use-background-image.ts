import { useBackgroundImageFileDb } from "@/lib/file-db/file-db-store";
import { useCallback } from "react";
import { toast } from "@/components/ui/toast";
import { errorLogWithToast } from "@/lib/error-toast";

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
        toast.add({ title: "Image file loaded", type: "success" });
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
