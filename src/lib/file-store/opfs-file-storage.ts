import type { FileStorage } from "@/lib/file-store/file-storage";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";

const DIRECTORY_NAME = "mivi-files";

/** OPFS keeps only the bytes, so the File identity is stored beside them */
interface StoredFileMeta {
  name: string;
  type: string;
  lastModified: number;
}

const metaKey = (key: string) => `${key}.meta.json`;

function isNotFound(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

async function writeEntry(dir: FileSystemDirectoryHandle, name: string, data: Blob | string) {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  try {
    await writable.write(data);
  } finally {
    await writable.close();
  }
}

async function readEntry(dir: FileSystemDirectoryHandle, name: string): Promise<File | undefined> {
  try {
    const handle = await dir.getFileHandle(name);
    return await handle.getFile();
  } catch (error) {
    if (isNotFound(error)) return undefined;
    throw error;
  }
}

async function removeEntry(dir: FileSystemDirectoryHandle, name: string): Promise<void> {
  try {
    await dir.removeEntry(name);
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
}

export function isOpfsSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.storage?.getDirectory === "function" &&
    typeof FileSystemFileHandle !== "undefined" &&
    "createWritable" in FileSystemFileHandle.prototype
  );
}

export class OpfsFileStorage implements FileStorage {
  #directory: Promise<FileSystemDirectoryHandle> | undefined;

  #getDirectory(): Promise<FileSystemDirectoryHandle> {
    this.#directory ??= navigator.storage
      .getDirectory()
      .then((root) => root.getDirectoryHandle(DIRECTORY_NAME, { create: true }));
    return this.#directory;
  }

  async read(key: string): Promise<File | undefined> {
    const dir = await this.#getDirectory();
    const [metaFile, dataFile] = await Promise.all([
      readEntry(dir, metaKey(key)),
      readEntry(dir, key),
    ]);
    if (!metaFile || !dataFile) return undefined;
    const meta = JSON.parse(await metaFile.text()) as StoredFileMeta;
    return new File([dataFile], meta.name, { type: meta.type, lastModified: meta.lastModified });
  }

  async write(key: string, file: File): Promise<void> {
    const dir = await this.#getDirectory();
    const meta: StoredFileMeta = {
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
    };
    // Bytes go first so that a present meta file always describes a complete payload
    await writeEntry(dir, key, file);
    await writeEntry(dir, metaKey(key), JSON.stringify(meta));
  }

  async remove(key: string): Promise<void> {
    const dir = await this.#getDirectory();
    await Promise.all([removeEntry(dir, metaKey(key)), removeEntry(dir, key)]);
  }

  async clear(): Promise<void> {
    const root = await navigator.storage.getDirectory();
    this.#directory = undefined;
    try {
      await root.removeEntry(DIRECTORY_NAME, { recursive: true });
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }
}

export function createFileStorage(): FileStorage {
  return isOpfsSupported() ? new OpfsFileStorage() : new MemoryFileStorage();
}
