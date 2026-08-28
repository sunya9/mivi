import { StreamTargetChunk } from "mediabunny";

export interface OpfsExportFile {
  target: WritableStream<StreamTargetChunk>;
  getFile(): Promise<File>;
  remove(): Promise<void>;
}

export async function createOpfsExportFile(fileName: string): Promise<OpfsExportFile> {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();

  const target = new WritableStream<StreamTargetChunk>({
    write: (chunk) => writable.write(chunk),
    close: () => writable.close(),
    abort: (reason) => writable.abort(reason),
  });

  return {
    target,
    getFile: () => fileHandle.getFile(),
    remove: () => root.removeEntry(fileName),
  };
}
