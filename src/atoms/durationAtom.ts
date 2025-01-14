import { audioDurationAtom } from "@/atoms/playerAtom";
import { midiDurationAtom } from "@/atoms/midiAtom";
import { atom } from "jotai";

export const durationAtom = atom(async (get) => {
  const audioDuration: number = await get(audioDurationAtom);
  const midiDuration = await get(midiDurationAtom);
  return Math.max(midiDuration, audioDuration);
});
