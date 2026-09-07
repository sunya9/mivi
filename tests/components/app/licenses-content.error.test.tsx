import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { LicensesContent } from "@/components/app/licenses-content";

vi.mock("virtual:license-notices", () => {
  throw new Error("chunk failed to load");
});

test("shows an error instead of spinning forever when the chunk cannot load", async () => {
  render(<LicensesContent />);

  expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load the license list");
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});
