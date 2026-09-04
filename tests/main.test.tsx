import { screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("should render the app", { timeout: 10000 }, async () => {
  const container = document.createElement("div");
  container.id = "root";
  document.body.appendChild(container);
  await import("@/main");
  const app = await screen.findByText("MiVi");
  expect(app).toBeInTheDocument();
});
