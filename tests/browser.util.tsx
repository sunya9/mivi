import { page } from "vitest/browser";
import { TestProviders } from "./test-providers";
import { createAppContext } from "@/lib/globals";

interface RenderOptions {
  viewport?: { width: number; height: number };
}

export async function customPageRender(
  children: React.ReactNode,
  options?: RenderOptions,
) {
  if (options?.viewport) {
    await page.viewport(options.viewport.width, options.viewport.height);
  }
  const appContextValue = createAppContext(new AudioContext());
  return page.render(
    <TestProviders appContextValue={appContextValue}>{children}</TestProviders>,
  );
}
