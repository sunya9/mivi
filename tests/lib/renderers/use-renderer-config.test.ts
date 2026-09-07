import { act } from "@testing-library/react";
import { customRenderHook } from "tests/util";
import { test, expect, vi } from "vitest";

import { useRendererConfig, useUpdateRendererConfig } from "@/lib/renderers/use-renderer-config";
import { shallowEqual } from "@/lib/store/observable-store";

test("updates config with partial changes", async () => {
  const { result } = await customRenderHook(() => ({
    backgroundColor: useRendererConfig((config) => config.backgroundColor),
    update: useUpdateRendererConfig(),
  }));

  act(() => result.current.update({ backgroundColor: "#ffffff" }));

  expect(result.current.backgroundColor).toBe("#ffffff");
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
  const { result } = await customRenderHook(() => {
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

  act(() => result.current.update({ pianoRollConfig: { noteMargin: 6 } }));
  expect(renders.mock.calls.length).toBe(before);

  act(() => result.current.update({ fps: 60 }));
  expect(result.current.common.fps).toBe(60);
});
