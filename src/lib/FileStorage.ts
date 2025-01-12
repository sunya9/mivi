import { AudioHandler } from "@/lib/AudioHandler";
import { MidiState } from "@/types/midi";
import { getDefaultRendererConfig, RendererConfig } from "@/types/renderer";
import defaultsDeep from "lodash.defaultsdeep";

const DB_NAME = "midiVisualizer";
const STORE_NAME = "files";

async function initializeDB(): Promise<[IDBDatabase, string]> {
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

async function loadAudio(
  audioContext: AudioContext,
  audio: File,
  initialVolume?: number,
  initialMuted?: boolean,
) {
  const arrayBuffer = await audio.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return new AudioHandler(
    audioContext,
    audioBuffer,
    audio,
    initialVolume,
    initialMuted,
  );
}

export type LoadDbResult = readonly [
  FileStorage,
  {
    readonly midi: MidiState | undefined;
    readonly audio: File | undefined;
    readonly initialRendererConfig: RendererConfig;
    readonly initialAudioHandler: AudioHandler | undefined;
  },
];
export async function loadDb(
  audioContext: AudioContext,
): Promise<LoadDbResult> {
  const [db, storeName] = await initializeDB();
  const fileStorage = new FileStorage(db, storeName);
  const data = await fileStorage.loadData();
  const initialAudioHandler = data.audio
    ? await loadAudio(
        audioContext,
        data.audio,
        data.rendererConfig.previewVolume,
        data.rendererConfig.previewMuted,
      )
    : undefined;
  return [
    fileStorage,
    {
      midi: data.midi,
      audio: data.audio,
      initialRendererConfig: data.rendererConfig,
      initialAudioHandler,
    },
  ] as const;
}

export async function resetDb() {
  const [db, storeName] = await initializeDB();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.addEventListener(
      "complete",
      () => {
        console.log("resetDb: complete");
        resolve();
      },
      { once: true },
    );
    transaction.addEventListener("error", () => {
      console.error("resetDb: error");
      reject(new Error("resetDb: error"));
    });
    transaction.addEventListener("abort", () => {
      console.error("resetDb: abort");
      reject(new Error("resetDb: abort"));
    });
    const objectStore = transaction.objectStore(storeName);
    const objectStoreRequest = objectStore.clear();
    objectStoreRequest.addEventListener(
      "success",
      () => {
        console.log(`resetDb: clear ${storeName}`);
      },
      { once: true },
    );
    objectStoreRequest.addEventListener("error", () => {
      console.error("resetDb: clear error");
      reject(new Error("resetDb: clear error"));
    });
  });
  db.close();
}

export interface LoadDataResponse {
  midi?: MidiState;
  audio?: File;
  rendererConfig: RendererConfig;
}

interface StoredDataRequest {
  midi?: MidiState | null;
  audio?: File | null;
  rendererConfig?: RendererConfig;
}

export class FileStorage {
  private static readonly midiKey = "lastMidi";
  private static readonly audioKey = "lastAudio";
  private static readonly rendererConfigKey = "rendererConfig";
  constructor(
    private readonly db: IDBDatabase,
    private readonly storeName: string,
  ) {}

  async storeData(data: StoredDataRequest): Promise<void> {
    const audioFile = data.audio
      ? new File([data.audio], data.audio.name, {
          type: data.audio.type,
        })
      : undefined;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      if (data.audio === null) {
        store.delete(FileStorage.audioKey);
      } else if (audioFile) {
        store.put(audioFile, FileStorage.audioKey);
      }
      if (data.midi === null) {
        store.delete(FileStorage.midiKey);
      } else if (data.midi) {
        store.put(data.midi, FileStorage.midiKey);
      }
      if (data.rendererConfig)
        store.put(data.rendererConfig, FileStorage.rendererConfigKey);

      transaction.onerror = () => {
        console.error("Failed to store data", transaction.error);
        reject(transaction.error);
      };

      transaction.oncomplete = () => resolve();
    });
  }

  async loadData(): Promise<LoadDataResponse> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);

      const midiRequest = store.get(FileStorage.midiKey);
      const audioRequest = store.get(FileStorage.audioKey);
      const rendererConfigRequest = store.get(FileStorage.rendererConfigKey);

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
      const rendererConfigPromise = new Promise<RendererConfig>((resolve) => {
        rendererConfigRequest.addEventListener(
          "success",
          () => {
            resolve(
              defaultsDeep(
                rendererConfigRequest.result,
                getDefaultRendererConfig(),
              ),
            );
          },
          {
            once: true,
          },
        );
        rendererConfigRequest.addEventListener(
          "error",
          () => resolve(getDefaultRendererConfig()),
          {
            once: true,
          },
        );
      });
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
        rendererConfigPromise,
      ]).then(async ([midi, audio, rendererConfig]) => {
        return {
          midi,
          audio,
          rendererConfig,
        } satisfies LoadDataResponse;
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
