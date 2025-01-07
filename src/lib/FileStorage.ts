import { MidiState } from "@/types/midi";

const DB_NAME = "midiVisualizer";
const STORE_NAME = "files";

export async function initializeDB(): Promise<[IDBDatabase, string]> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  }).catch((error) => {
    console.error("Failed to initialize IndexedDB:", error);
    throw error;
  });

  return [db, STORE_NAME] as const;
}

export interface StoredData {
  midi?: MidiState;
  audio?: File;
}

export class FileStorage {
  private static readonly midiKey = "lastMidi";
  private static readonly audioKey = "lastAudio";

  constructor(
    private readonly db: IDBDatabase,
    private readonly storeName: string,
  ) {}

  async storeData(data: StoredData): Promise<void> {
    const audioFile = data.audio
      ? new File([data.audio], data.audio.name, {
          type: data.audio.type,
        })
      : undefined;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);

      if (data.midi) store.put(data.midi, FileStorage.midiKey);
      if (audioFile) store.put(audioFile, FileStorage.audioKey);

      transaction.onerror = () => {
        console.error("Failed to store data", transaction.error);
        reject(transaction.error);
      };

      transaction.oncomplete = () => resolve();
    });
  }

  async loadData(): Promise<StoredData> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);

      const midiRequest = store.get(FileStorage.midiKey);
      const audioRequest = store.get(FileStorage.audioKey);

      const midiRequetPromise = new Promise<MidiState | undefined>(
        (resolve) => {
          midiRequest.addEventListener(
            "success",
            () => resolve(midiRequest.result),
            {
              once: true,
            },
          );
          midiRequest.addEventListener("error", () => resolve(undefined), {
            once: true,
          });
        },
      );
      const audioRequestPromise = new Promise<File | undefined>((resolve) => {
        audioRequest.addEventListener(
          "success",
          () => resolve(audioRequest.result),
          {
            once: true,
          },
        );
        audioRequest.addEventListener("error", () => resolve(undefined), {
          once: true,
        });
      });
      const resultPromise = Promise.all([
        midiRequetPromise,
        audioRequestPromise,
      ]).then(async ([midi, audio]) => {
        return {
          midi,
          audio,
        } satisfies StoredData;
      });

      transaction.onerror = () => reject(transaction.error);

      transaction.oncomplete = async () => {
        const result = await resultPromise.catch((error) => {
          console.error("Failed to load data", error);
        });
        if (!result) {
          reject(new Error("Failed to load data"));
          return;
        }
        resolve(result);
      };
    });
  }
}
