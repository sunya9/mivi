import { act } from "@testing-library/react";
import { customRenderHook } from "tests/util";
import { test, expect, vi } from "vitest";

import {
  useRendererConfig,
  useRendererSection,
  useUpdateRendererConfig,
} from "@/hooks/use-renderer-config";
import { shallowEqual } from "@/lib/store/observable-store";

test("updates top-level fields and keeps the rest", async () => {
  const { result, appContextValue } = await customRenderHook(() => ({
    backgroundColor: useRendererConfig((config) => config.backgroundColor),
    update: useUpdateRendererConfig(),
  }));
  const before = appContextValue.rendererConfigStore.getSnapshot();

  act(() => result.current.update({ backgroundColor: "#ffffff" }));

  expect(result.current.backgroundColor).toBe("#ffffff");
  expect(appContextValue.rendererConfigStore.getSnapshot()).toEqual({
    ...before,
    backgroundColor: "#ffffff",
  });
});

test("a section update replaces only that section", async () => {
  const { result, appContextValue } = await customRenderHook(() => {
    const [config, update] = useRendererSection("pianoRollConfig");
    return { config, update, comet: useRendererConfig((c) => c.cometConfig) };
  });
  const { pianoRollConfig, cometConfig } = appContextValue.rendererConfigStore.getSnapshot();

  act(() => result.current.update({ noteMargin: 6, timeWindow: 3 }));

  expect(result.current.config).toEqual({ ...pianoRollConfig, noteMargin: 6, timeWindow: 3 });
  expect(result.current.comet).toBe(cometConfig);
});

test("a slice keeps its identity and does not re-render when another field changes", async () => {
  const renders = vi.fn<() => void>();
  const { result } = await customRenderHook(() => {
    renders();
    return {
      pianoRoll: useRendererConfig((config) => config.pianoRollConfig),
      update: useUpdateRendererConfig(),
    };
  });
  const pianoRoll = result.current.pianoRoll;
  const before = renders.mock.calls.length;

  act(() => result.current.update({ fps: 60 }));

  expect(result.current.pianoRoll).toBe(pianoRoll);
  expect(renders.mock.calls.length).toBe(before);
});

test("an object selector with shallowEqual only re-renders when a picked field changes", async () => {
  const renders = vi.fn<() => void>();
  const { result, appContextValue } = await customRenderHook(() => {
    renders();
    return {
      common: useRendererConfig(
        (config) => ({ fps: config.fps, format: config.format }),
        shallowEqual,
      ),
      update: useUpdateRendererConfig(),
    };
  });
  const before = renders.mock.calls.length;

  act(() =>
    appContextValue.rendererConfigStore.set((prev) => ({
      ...prev,
      pianoRollConfig: { ...prev.pianoRollConfig, noteMargin: 6 },
    })),
  );
  expect(renders.mock.calls.length).toBe(before);

  act(() => result.current.update({ fps: 60 }));
  expect(result.current.common.fps).toBe(60);
});
