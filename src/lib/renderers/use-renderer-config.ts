import { useCallback } from "react";

import { useAppContext } from "@/contexts/app-context";
import { useStore } from "@/hooks/use-store";
import { RendererConfig } from "@/lib/renderers/renderer";
import { mergeShared } from "@/lib/store/merge-shared";
import { DeepPartial } from "@/lib/type-utils";

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
    (partial: DeepPartial<RendererConfig>) => {
      rendererConfigStore.set((prev) => mergeShared(prev, partial));
    },
    [rendererConfigStore],
  );
}
