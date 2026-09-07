import { errorLogWithToast } from "@/lib/error-toast";
import type { FileStorage } from "@/lib/file-store/file-storage";
import { ObservableStore, shallowEqual } from "@/lib/store/observable-store";

export interface FileSlotSnapshot<T> {
  file: File | undefined;
  decoded: T | undefined;
  decoding: boolean;
}

export type FileDecoder<T> = (file: File, signal: AbortSignal) => Promise<T>;

export interface FileSlotOptions<T> {
  key: string;
  label: string;
  storage: FileStorage;
  decode: FileDecoder<T>;
}

const EMPTY: FileSlotSnapshot<never> = { file: undefined, decoded: undefined, decoding: false };

interface InFlight {
  controller: AbortController;
  rollback: () => void;
}

/** Only the file is persisted; decoding runs again on load so no decoded format has to survive */
export class FileSlot<T> extends ObservableStore<FileSlotSnapshot<T>> {
  readonly #key: string;
  readonly #label: string;
  readonly #storage: FileStorage;
  readonly #decode: FileDecoder<T>;
  #loading: Promise<void> | undefined;
  #loaded = false;
  #inFlight: InFlight | undefined;

  constructor({ key, label, storage, decode }: FileSlotOptions<T>) {
    super(EMPTY, shallowEqual);
    this.#key = key;
    this.#label = label;
    this.#storage = storage;
    this.#decode = decode;
  }

  get loaded(): boolean {
    return this.#loaded;
  }
  load(): Promise<void> {
    if (this.#loaded) return Promise.resolve();
    this.#loading ??= this.#storage.read(this.#key).then((file) => {
      this.#loaded = true;
      if (!file) return;
      void this.#run(file, {
        pending: { file, decoded: undefined, decoding: true },
        rollback: () => this.#clear(),
        persist: false,
      });
    });
    return this.#loading;
  }

  reset = (): void => {
    if (!this.#loaded) this.#loading = undefined;
  };

  cancel = (): void => {
    const inFlight = this.#inFlight;
    if (!inFlight) return;
    this.#inFlight = undefined;
    inFlight.controller.abort();
    inFlight.rollback();
  };
  setFile = async (file: File | undefined): Promise<boolean> => {
    this.cancel();
    if (!file) {
      this.#clear();
      return true;
    }
    const previous = this.getSnapshot();
    return this.#run(file, {
      pending: { ...previous, decoding: true },
      rollback: () => this.setSnapshot({ ...previous, decoding: false }),
      persist: true,
    });
  };

  #clear(): void {
    this.setSnapshot(EMPTY);
    void this.#storage.remove(this.#key).catch((error) => {
      errorLogWithToast("Failed to remove file", error);
    });
  }

  async #run(
    file: File,
    options: { pending: FileSlotSnapshot<T>; rollback: () => void; persist: boolean },
  ): Promise<boolean> {
    const controller = new AbortController();
    this.#inFlight = { controller, rollback: options.rollback };
    this.setSnapshot(options.pending);
    try {
      const decoded = await this.#decode(file, controller.signal);
      if (controller.signal.aborted) return false;
      this.#inFlight = undefined;
      this.setSnapshot({ file, decoded, decoding: false });
      if (options.persist) await this.#write(file);
      return true;
    } catch (error) {
      if (controller.signal.aborted) return false;
      this.#inFlight = undefined;
      errorLogWithToast(`Failed to load ${this.#label}`, error);
      options.rollback();
      return false;
    }
  }

  async #write(file: File): Promise<void> {
    try {
      await this.#storage.write(this.#key, file);
    } catch (error) {
      errorLogWithToast("Failed to save file", error);
    }
  }
}
