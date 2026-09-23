import { useCallback } from "react";

import { toast } from "@/components/ui/toast";
import { useAppContext } from "@/contexts/app-context";
import { useFileSlot } from "@/lib/file-store/use-file-slot";

export function useSetBackgroundImageFile() {
  const { backgroundImage } = useAppContext().fileStore;
  return useCallback(
    async (file: File | undefined) => {
      const loaded = await backgroundImage.setFile(file);
      if (loaded && file) toast.add({ title: "Image file loaded", type: "success" });
    },
    [backgroundImage],
  );
}

export function useBackgroundImage() {
  const { backgroundImage } = useAppContext().fileStore;
  const { file: backgroundImageFile, decoded: backgroundImageBitmap } =
    useFileSlot(backgroundImage);
  const setBackgroundImageFile = useSetBackgroundImageFile();
  return { backgroundImageBitmap, setBackgroundImageFile, backgroundImageFile };
}
