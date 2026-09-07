import { toMerged } from "es-toolkit";

import { getDefaultRendererConfig, RendererConfig } from "@/lib/renderers/renderer";
import { PersistedStore } from "@/lib/store/persisted-store";

export type RendererConfigStore = PersistedStore<RendererConfig>;

/** Persisted config filled up with defaults, so newly added fields never read as undefined */
export function createRendererConfigStore(): RendererConfigStore {
  const defaultConfig = getDefaultRendererConfig();
  return new PersistedStore<RendererConfig>("mivi:renderer-config", (persisted) =>
    toMerged(defaultConfig, persisted ?? {}),
  );
}
