import { page } from "vitest/browser";
import { Providers } from "@/components/providers/providers";

export function customPageRender(children: React.ReactNode) {
  return page.render(<Providers>{children}</Providers>);
}
