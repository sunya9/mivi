const LEGACY_INDEXED_DB = "mivi:file";
const LEGACY_MIDI_TRACKS_KEY = "mivi:midi-tracks";

export async function purgeLegacyStorage(): Promise<void> {
  localStorage.removeItem(LEGACY_MIDI_TRACKS_KEY);
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(LEGACY_INDEXED_DB);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}
