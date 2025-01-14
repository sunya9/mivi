import { getDefaultRendererConfig, RendererConfig } from "@/types/renderer";
import { DeepPartial } from "@/types/util";
import { atom, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
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
  (get) => get(rendererConfigStorageAtom),
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
