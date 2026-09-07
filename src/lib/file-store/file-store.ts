import type { SerializedAudio } from "@/lib/audio/audio";
import { FileSlot, type FileDecoder } from "@/lib/file-store/file-slot";
import type { FileStorage } from "@/lib/file-store/file-storage";
import type { MidiTracks } from "@/lib/midi/midi";

export interface FileDecoders {
  midi: FileDecoder<MidiTracks>;
  audio: FileDecoder<SerializedAudio>;
  backgroundImage: FileDecoder<ImageBitmap>;
}

type LoadableSlot = Pick<FileSlot<unknown>, "load" | "reset" | "loaded">;

export class FileStore {
  readonly midi: FileSlot<MidiTracks>;
  readonly audio: FileSlot<SerializedAudio>;
  readonly backgroundImage: FileSlot<ImageBitmap>;
  readonly #storage: FileStorage;
  #preloaded: Promise<void> | undefined;

  constructor(storage: FileStorage, decoders: FileDecoders) {
    this.#storage = storage;
    this.midi = new FileSlot({ key: "midi", label: "MIDI file", storage, decode: decoders.midi });
    this.audio = new FileSlot({
      key: "audio",
      label: "audio file",
      storage,
      decode: decoders.audio,
    });
    this.backgroundImage = new FileSlot({
      key: "background-image",
      label: "background image",
      storage,
      decode: decoders.backgroundImage,
    });
  }

  get slots(): readonly LoadableSlot[] {
    return [this.midi, this.audio, this.backgroundImage];
  }

  preload(): Promise<void> {
    this.#preloaded ??= Promise.all(this.slots.map((slot) => slot.load())).then(() => undefined);
    return this.#preloaded;
  }

  reset = (): void => {
    this.#preloaded = undefined;
    this.slots.forEach((slot) => slot.reset());
  };

  clear(): Promise<void> {
    return this.#storage.clear();
  }
}
