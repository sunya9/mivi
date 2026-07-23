import { StreamTargetChunk } from "mediabunny";

export interface OpfsExportFile {
  target: WritableStream<StreamTargetChunk>;
  getFile(): Promise<File>;
  remove(): Promise<void>;
}

// Muxers patch previously written regions (WebM cues/duration, MP4 moov), so
// the sink must honor each chunk's absolute position instead of appending.
// OPFS supports positioned writes, which is why it can host a muxer target.
export async function createOpfsExportFile(fileName: string): Promise<OpfsExportFile> {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName, { create: true });
  // createWritable() truncates by default, so reusing a name overwrites cleanly
  const writable = await fileHandle.createWritable();

  const target = new WritableStream<StreamTargetChunk>({
    // Returning the promise propagates disk backpressure up to the muxer
    write: (chunk) => writable.write(chunk),
    close: () => writable.close(),
    abort: () => writable.abort(),
  });

  return {
    target,
    getFile: () => fileHandle.getFile(),
    remove: () => root.removeEntry(fileName),
  };
}
