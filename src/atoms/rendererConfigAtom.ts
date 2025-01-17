import { getDefaultRendererConfig, RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";
import { atom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import defaultsDeep from "lodash.defaultsdeep";
import merge from "lodash.merge";
import { useCallback } from "react";

const defaultConfig = getDefaultRendererConfig();

const rendererConfigStorageAtom = atomWithStorage(
  "mivi:renderer-config",
  defaultConfig,
  undefined,
  {
    getOnInit: true,
  },
);

export const rendererConfigAtom = atom<
  RendererConfig,
  [DeepPartial<RendererConfig>],
  void
>(
  (get) => {
    const config = get(rendererConfigStorageAtom);
    return defaultsDeep(config, defaultConfig); // add new default config always
  },
  (get, set, deepPartialRendererConfig) => {
    const mergedRendererConfig = merge(
      get(rendererConfigStorageAtom),
      deepPartialRendererConfig,
    );
    set(rendererConfigStorageAtom, { ...mergedRendererConfig });
  },
);

export const useSetPianoRollConfig = () => {
  const setRendererConfig = useSetAtom(rendererConfigAtom);
  return useCallback(
    (pianoRollConfig: DeepPartial<RendererConfig["pianoRollConfig"]>) =>
      setRendererConfig({ pianoRollConfig }),
    [setRendererConfig],
  );
};
