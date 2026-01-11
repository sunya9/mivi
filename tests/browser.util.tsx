import { page } from "vitest/browser";
import { TestProviders } from "./test-providers";
import { createAppContext } from "@/lib/globals";

export function customPageRender(children: React.ReactNode) {
  const appContextValue = createAppContext(new AudioContext());
  return page.render(
    <TestProviders appContextValue={appContextValue}>{children}</TestProviders>,
  );
}
