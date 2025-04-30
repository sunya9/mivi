import { expect, test, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/react";
import { useIndexedDb } from "@/lib/file-db/use-indexed-db";
import { customRenderHook } from "tests/util";
import { saveFile } from "@/lib/file-db/file-db";

const mockKey = "test-key";
const mockFile = new File(["test content"], "test.txt", { type: "text/plain" });

beforeEach(() => {
  vi.clearAllMocks();
});

test("should initialize with undefined file when no file exists", async () => {
  const { result } = customRenderHook(() => useIndexedDb(mockKey));
  await waitFor(() => {
    expect(result.current.file).toBeUndefined();
  });
});

test("should initialize with cached file when available", async () => {
  await saveFile(mockKey, mockFile);
  const { result } = customRenderHook(() => useIndexedDb(mockKey));
  await waitFor(() => {
    expect(result.current.file?.name).toBe(mockFile.name);
  });
});

test("should set and save file successfully", async () => {
  const { result } = customRenderHook(() => useIndexedDb(mockKey));

  await waitFor(async () => {
    await result.current.setFile(mockFile);
    expect(result.current.file).toEqual(mockFile);
  });
});

test("should clear file when set to undefined", async () => {
  await saveFile(mockKey, mockFile);
  const { result } = customRenderHook(() => useIndexedDb(mockKey));

  await waitFor(async () => {
    await result.current.setFile(undefined);
    expect(result.current.file).toBeUndefined();
  });
});
