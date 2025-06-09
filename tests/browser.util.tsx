import { page } from "@vitest/browser/context";
import { Providers } from "@/components/providers/providers";

export function customPageRender(children: React.ReactNode) {
  return page.render(<Providers>{children}</Providers>);
}
