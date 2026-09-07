import { runDecodeWorker } from "@/lib/audio/run-decode-worker";
import type { FileDecoders } from "@/lib/file-store/file-store";
import { parseMidi } from "@/lib/midi/parse-midi";

export const fileDecoders: FileDecoders = {
  midi: parseMidi,
  audio: runDecodeWorker,
  backgroundImage: (file) => createImageBitmap(file),
};
