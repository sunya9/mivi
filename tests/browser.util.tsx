import { AudioContext } from "standardized-audio-context";
import { page } from "vitest/browser";

import { createAppContext } from "@/contexts/app-context";

import { TestProviders } from "./test-providers";

interface RenderOptions {
  viewport?: { width: number; height: number };
}

export async function customPageRender(children: React.ReactNode, options?: RenderOptions) {
  if (options?.viewport) {
    await page.viewport(options.viewport.width, options.viewport.height);
  }
  const appContextValue = createAppContext(new AudioContext());
  return page.render(<TestProviders appContextValue={appContextValue}>{children}</TestProviders>);
}
