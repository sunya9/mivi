import { Providers } from "@/components/providers/providers";
import {
  renderHook,
  RenderHookOptions,
  render as renderOriginal,
} from "@testing-library/react";

export function customRender(children: React.ReactNode) {
  return renderOriginal(<Providers>{children}</Providers>);
}

export function customRenderHook<T, P>(
  hook: (props: P) => T,
  options?: RenderHookOptions<P>,
) {
  return renderHook((props: P) => hook(props), {
    wrapper: ({ children }) => <Providers>{children}</Providers>,
    ...options,
  });
}
