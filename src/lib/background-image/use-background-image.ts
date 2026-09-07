import { useCallback } from "react";

import { toast } from "@/components/ui/toast";
import { useFileSlot, useFileStore } from "@/lib/file-store/use-file-store";

export function useSetBackgroundImageFile() {
  const { backgroundImage } = useFileStore();
  return useCallback(
    async (file: File | undefined) => {
      const loaded = await backgroundImage.setFile(file);
      if (loaded && file) toast.add({ title: "Image file loaded", type: "success" });
    },
    [backgroundImage],
  );
}

export function useBackgroundImage() {
  const { backgroundImage } = useFileStore();
  const { file: backgroundImageFile, decoded: backgroundImageBitmap } =
    useFileSlot(backgroundImage);
  const setBackgroundImageFile = useSetBackgroundImageFile();
  return { backgroundImageBitmap, setBackgroundImageFile, backgroundImageFile };
}
