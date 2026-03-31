import { AppContextValue, createAppContext } from "@/contexts/app-context";
import { renderHook, RenderHookOptions, render as renderOriginal } from "@testing-library/react";
import { TestProviders } from "./test-providers";
import { AudioContext } from "standardized-audio-context-mock";

export function customRender(
  children: React.ReactNode,
  options?: { appContextValue?: AppContextValue },
) {
  const appContextValue = options?.appContextValue ?? createAppContext(new AudioContext());
  return renderOriginal(children, {
    wrapper: ({ children }) => (
      <TestProviders appContextValue={appContextValue}>{children}</TestProviders>
    ),
  });
}

/**
 * Render a hook with access to the AppContextValue for testing.
 * Returns both the hook result and the appContextValue used.
 */
export function customRenderHook<T, P>(hook: (props: P) => T, options?: RenderHookOptions<P>) {
  const audioContext = new AudioContext();
  const appContextValue = createAppContext(audioContext);
  const result = renderHook((props: P) => hook(props), {
    wrapper: ({ children }) => (
      <TestProviders appContextValue={appContextValue}>{children}</TestProviders>
    ),
    ...options,
  });
  return { ...result, appContextValue };
}

export async function fetchFixtureAsFile(path: string, name: string, type: string): Promise<File> {
  return fetch(path)
    .then((res) => res.blob())
    .then((blob) => new File([blob], name, { type }));
}
