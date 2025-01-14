import { MiniDb } from "jotai-minidb";

export const fileDb = new MiniDb<File | undefined>({
  name: "mivi:file",
});
export const fileKeys = {
  audio: "audio",
  midi: "midi",
} as const;
