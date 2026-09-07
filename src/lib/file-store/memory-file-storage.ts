import type { FileStorage } from "@/lib/file-store/file-storage";

export class MemoryFileStorage implements FileStorage {
  readonly #files = new Map<string, File>();

  async read(key: string): Promise<File | undefined> {
    return this.#files.get(key);
  }

  async write(key: string, file: File): Promise<void> {
    this.#files.set(key, file);
  }

  async remove(key: string): Promise<void> {
    this.#files.delete(key);
  }

  async clear(): Promise<void> {
    this.#files.clear();
  }
}
