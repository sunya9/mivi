import {
  act,
  renderHook,
  RenderHookOptions,
  RenderHookResult,
  RenderResult,
  render as renderOriginal,
} from "@testing-library/react";
import { AudioContext } from "standardized-audio-context-mock";

import { AppContextValue, createAppContext } from "@/contexts/app-context";
import { FileDbStore } from "@/lib/file-db/file-db-store";

import { TestProviders } from "./test-providers";

export async function customRender(
  children: React.ReactNode,
  options?: { appContextValue?: AppContextValue },
): Promise<RenderResult> {
  const appContextValue = options?.appContextValue ?? createAppContext(new AudioContext());
  const fileDbStore = new FileDbStore();
  let result!: RenderResult;
  await act(async () => {
    result = renderOriginal(children, {
      wrapper: ({ children }) => (
        <TestProviders appContextValue={appContextValue} fileDbStore={fileDbStore}>
          {children}
        </TestProviders>
      ),
    });
    await fileDbStore.preload();
  });
  return result;
}

/**
 * Render a hook with access to the AppContextValue for testing.
 * Returns both the hook result and the appContextValue used.
 */
export async function customRenderHook<T, P>(
  hook: (props: P) => T,
  options?: RenderHookOptions<P>,
) {
  const audioContext = new AudioContext();
  const appContextValue = createAppContext(audioContext);
  const fileDbStore = new FileDbStore();
  let result!: RenderHookResult<T, P>;
  await act(async () => {
    result = renderHook((props: P) => hook(props), {
      wrapper: ({ children }) => (
        <TestProviders appContextValue={appContextValue} fileDbStore={fileDbStore}>
          {children}
        </TestProviders>
      ),
      ...options,
    });
    await fileDbStore.preload();
  });
  return { ...result, appContextValue };
}

export async function fetchFixtureAsFile(path: string, name: string, type: string): Promise<File> {
  return fetch(path)
    .then((res) => res.blob())
    .then((blob) => new File([blob], name, { type }));
}
