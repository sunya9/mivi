import { useCallback } from "react";

import { toast } from "@/components/ui/toast";
import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { hashArrayBuffer } from "@/lib/hash";

/** Reads the tracks on demand so callers do not re-render on every edit */
export function useSetMidiFile() {
  const { fileStore, midiTracksStore, midiSettingsStore, confirmStore } = useAppContext();

  return useCallback(
    async (midiFile: File | undefined) => {
      if (!midiFile) {
        await fileStore.midi.setFile(undefined);
        return;
      }
      const newHash = await hashArrayBuffer(await midiFile.arrayBuffer());
      if (midiTracksStore.getSnapshot()?.hash === newHash) {
        const shouldOverwrite = await confirmStore.confirm({
          title: "Same file detected",
          description:
            "The same MIDI file is already loaded. Do you want to overwrite the current settings (offset, track settings, etc.)?",
          confirmLabel: "Overwrite",
          cancelLabel: "Keep",
          variant: "default",
        });
        if (!shouldOverwrite) return;
        // Same hash would otherwise re-apply the persisted settings to the reloaded file
        midiSettingsStore.set(undefined);
      }
      const loaded = await fileStore.midi.setFile(midiFile);
      if (loaded) toast.add({ title: "MIDI file loaded", type: "success" });
    },
    [confirmStore, fileStore, midiSettingsStore, midiTracksStore],
  );
}

export function useMidi() {
  const { midiTracksStore } = useAppContext();
  const midiTracks = useStore(midiTracksStore, (tracks) => tracks);
  return { setMidiFile: useSetMidiFile(), midiTracks, setMidiTracks: midiTracksStore.set };
}
