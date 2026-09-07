export interface FileStorage {
  read(key: string): Promise<File | undefined>;
  write(key: string, file: File): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
