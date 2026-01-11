import { page } from "vitest/browser";
import { Providers } from "@/components/providers/providers";
import { createAppContext } from "@/lib/globals";

export function customPageRender(children: React.ReactNode) {
  const appContextValue = createAppContext();
  return page.render(
    <Providers appContextValue={appContextValue}>{children}</Providers>,
  );
}
