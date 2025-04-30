import { test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRendererConfig } from "@/lib/useRendererConfig";
import { getDefaultRendererConfig } from "@/types/renderer";

test("returns initial state is equal to default config", () => {
  const { result } = renderHook(() => useRendererConfig());

  expect(result.current.rendererConfig).toEqual(getDefaultRendererConfig());
});

test("updates config with partial changes", async () => {
  const { result } = await act(() => renderHook(() => useRendererConfig()));

  act(() => {
    result.current.onUpdateRendererConfig({
      backgroundColor: "#ffffff",
    });
  });
  expect(result.current.rendererConfig.backgroundColor).toBe("#ffffff");
});

test("deep merges nested config objects", () => {
  const { result } = renderHook(() => useRendererConfig());

  act(() => {
    result.current.onUpdateRendererConfig({
      pianoRollConfig: { noteMargin: 6 },
    });
  });
  const defaultConfig = getDefaultRendererConfig();
  expect(result.current.rendererConfig).toEqual({
    ...defaultConfig,
    pianoRollConfig: {
      ...defaultConfig.pianoRollConfig,
      noteMargin: 6,
    },
  });
});
