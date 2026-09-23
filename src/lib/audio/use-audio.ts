import { useCallback } from "react";

import { toast } from "@/components/ui/toast";
import { useAppContext } from "@/contexts/app-context";
import { useFileSlot } from "@/lib/file-store/use-file-slot";

export function useSetAudioFile() {
  const { audio } = useAppContext().fileStore;
  return useCallback(
    async (file: File | undefined) => {
      const loaded = await audio.setFile(file);
      if (loaded && file) toast.add({ title: "Audio file loaded", type: "success" });
    },
    [audio],
  );
}

export function useAudio() {
  const { audio } = useAppContext().fileStore;
  const { file: audioFile, decoding: isDecoding } = useFileSlot(audio);
  const setAudioFile = useSetAudioFile();

  const cancelDecode = useCallback(() => {
    if (!audio.getSnapshot().decoding) return;
    audio.cancel();
    toast.add({ title: "Audio loading cancelled", type: "info" });
  }, [audio]);

  return { setAudioFile, audioFile, isDecoding, cancelDecode };
}
