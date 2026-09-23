import { useCallback } from "react";

import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { RendererConfig } from "@/lib/renderers/renderer-config";

type RendererConfigSection =
  | "pianoRollConfig"
  | "verticalPianoRollConfig"
  | "cometConfig"
  | "barsConfig"
  | "lineSpectrumConfig"
  | "circularConfig";

export function useRendererConfig<S>(
  selector: (config: RendererConfig) => S,
  isEqual?: (a: S, b: S) => boolean,
): S {
  const { rendererConfigStore } = useAppContext();
  return useStore(rendererConfigStore, selector, isEqual);
}

export function useUpdateRendererConfig() {
  const { rendererConfigStore } = useAppContext();
  return useCallback(
    (partial: Partial<RendererConfig>) => {
      rendererConfigStore.set((prev) => ({ ...prev, ...partial }));
    },
    [rendererConfigStore],
  );
}

export function useRendererSection<S extends RendererConfigSection>(
  section: S,
): [RendererConfig[S], (partial: Partial<RendererConfig[S]>) => void] {
  const { rendererConfigStore } = useAppContext();
  const config = useStore(rendererConfigStore, (c) => c[section]);
  const update = useCallback(
    (partial: Partial<RendererConfig[S]>) => {
      rendererConfigStore.set((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...partial },
      }));
    },
    [rendererConfigStore, section],
  );
  return [config, update];
}
