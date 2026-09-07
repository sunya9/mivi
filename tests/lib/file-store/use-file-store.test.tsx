import { act, renderHook, type RenderHookResult, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { testMidiTracks } from "tests/fixtures";
import { expect, test } from "vitest";

import { FileStore } from "@/lib/file-store/file-store";
import { MemoryFileStorage } from "@/lib/file-store/memory-file-storage";
import { FileStoreContext, useFileSlot, useFileStore } from "@/lib/file-store/use-file-store";
import type { MidiTracks } from "@/lib/midi/midi";

const file = new File(["m"], "m.mid", { type: "audio/midi" });

function createStore() {
  const storage = new MemoryFileStorage();
  const store = new FileStore(storage, {
    midi: async () => testMidiTracks,
    audio: async () => {
      throw new Error("unused");
    },
    backgroundImage: async () => {
      throw new Error("unused");
    },
  });
  return { storage, store };
}

async function renderSlotHook(store: FileStore) {
  let rendered!: RenderHookResult<ReturnType<typeof useFileSlot<MidiTracks>>, unknown>;
  await act(async () => {
    rendered = renderHook(() => useFileSlot(useFileStore().midi), {
      wrapper: ({ children }) => (
        <FileStoreContext value={store}>
          <Suspense fallback={null}>{children}</Suspense>
        </FileStoreContext>
      ),
    });
    expect(rendered.result.current).toBeNull();
    await store.preload();
  });
  return rendered;
}

test("useFileStore throws outside the provider", () => {
  expect(() => renderHook(() => useFileStore())).toThrow(
    "useFileStore must be used within FileStoreContext",
  );
});

test("useFileSlot suspends until the stored file is read, then follows decoding", async () => {
  const { storage, store } = createStore();
  await storage.write("midi", file);

  const { result } = await renderSlotHook(store);

  await waitFor(() => expect(result.current.file).toBe(file));
  await waitFor(() => expect(result.current.decoded).toBe(testMidiTracks));
});

test("useFileSlot reflects setFile and clearing", async () => {
  const { store } = createStore();
  const { result } = await renderSlotHook(store);

  await store.midi.setFile(file);
  await waitFor(() => expect(result.current.decoded).toBe(testMidiTracks));

  await store.midi.setFile(undefined);
  await waitFor(() => expect(result.current.file).toBeUndefined());
});
