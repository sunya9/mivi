import { Providers } from "@/Providers";
import {
  renderHook,
  RenderHookOptions,
  render as renderOriginal,
} from "@testing-library/react";

export function customRender(children: React.ReactNode) {
  return renderOriginal(Providers({ children }));
}

export function customRenderHook<T, P>(
  hook: (props: P) => T,
  options?: RenderHookOptions<P>,
) {
  return renderHook((props: P) => hook(props), {
    wrapper: Providers,
    ...options,
  });
}
