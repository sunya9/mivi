import { screen } from "@testing-library/react";
import { customRender } from "tests/util";
import { test, expect } from "vitest";

import { AppHeader } from "@/components/app/app-header";

test("renders the title and the export button", async () => {
  await customRender(<AppHeader />);

  expect(screen.getByRole("heading")).toHaveTextContent("MiVi");
  expect(screen.getByRole("button")).toHaveTextContent("Start export");
});
