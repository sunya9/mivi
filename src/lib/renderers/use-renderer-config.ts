import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getDefaultRendererConfig,
  RendererConfig,
} from "@/lib/renderers/renderer";
import { DeepPartial } from "@/lib/type-utils";
import defaultsDeep from "lodash.defaultsdeep";
import merge from "lodash.merge";
import { useMemo, useCallback } from "react";

const defaultConfig = getDefaultRendererConfig();

export function useRendererConfig() {
  const [storedRendererConfig, setRendererConfig] =
    useLocalStorage<RendererConfig>("mivi:renderer-config");
  // add new default config always
  const rendererConfig: RendererConfig = useMemo(
    () => defaultsDeep(storedRendererConfig, defaultConfig),
    [storedRendererConfig],
  );
  const onUpdateRendererConfig = useCallback(
    (partial: DeepPartial<RendererConfig>) => {
      const newConfig: RendererConfig = merge(
        { ...rendererConfig },
        { ...partial },
      );
      setRendererConfig(newConfig);
    },
    [rendererConfig, setRendererConfig],
  );
  return { rendererConfig, onUpdateRendererConfig };
}
