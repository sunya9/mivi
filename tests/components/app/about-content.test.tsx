import { render, screen } from "@testing-library/react";
import { AppContextWrapper } from "tests/test-providers";
import { expect, test } from "vitest";

import { AboutContent } from "@/components/app/about-content";
import { checkBrowserApis } from "@/lib/browser-compat/browser-compat";

test("announces the support status of each browser API", () => {
  render(<AboutContent />, { wrapper: AppContextWrapper });

  const statuses = screen.getAllByRole("img", { name: /^(Supported|Not supported)$/ });
  expect(statuses).toHaveLength(checkBrowserApis().length);
});

test("presents the browser API panel as a note rather than a live alert", () => {
  render(<AboutContent />, { wrapper: AppContextWrapper });

  expect(screen.getByRole("note")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
