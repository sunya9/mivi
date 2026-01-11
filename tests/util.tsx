import { createAppContext } from "@/lib/globals";
import {
  renderHook,
  RenderHookOptions,
  render as renderOriginal,
} from "@testing-library/react";
import { TestProviders } from "./test-providers";

export function customRender(children: React.ReactNode) {
  const appContextValue = createAppContext();
  return renderOriginal(
    <TestProviders appContextValue={appContextValue}>{children}</TestProviders>,
  );
}

/**
 * Render a hook with access to the AppContextValue for testing.
 * Returns both the hook result and the appContextValue used.
 */
export function customRenderHook<T, P>(
  hook: (props: P) => T,
  options?: RenderHookOptions<P>,
) {
  const appContextValue = createAppContext();
  const result = renderHook((props: P) => hook(props), {
    wrapper: ({ children }) => (
      <TestProviders appContextValue={appContextValue}>
        {children}
      </TestProviders>
    ),
    ...options,
  });
  return { ...result, appContextValue };
}
