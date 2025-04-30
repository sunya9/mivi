import { useLocalStorage } from "@/lib/use-local-storage";
import { getDefaultRendererConfig, RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";
import defaultsDeep from "lodash.defaultsdeep";
import merge from "lodash.merge";
import { useMemo, useCallback } from "react";

const defaultConfig = getDefaultRendererConfig();

export const useRendererConfig = () => {
  const [storedRendererConfig, setRendererConfig] =
    useLocalStorage<RendererConfig>("mivi:renderer-config");
  // add new default config always
  const rendererConfig: RendererConfig = useMemo(
    () => defaultsDeep(storedRendererConfig, defaultConfig),
    [storedRendererConfig],
  );
  const onUpdateRendererConfig = useCallback(
    (partial: DeepPartial<RendererConfig>) => {
      const f = () => {
        const newConfig: RendererConfig = merge(
          { ...rendererConfig },
          { ...partial },
        );
        setRendererConfig(newConfig);
      };
      f();
    },
    [rendererConfig, setRendererConfig],
  );
  return { rendererConfig, onUpdateRendererConfig };
};
