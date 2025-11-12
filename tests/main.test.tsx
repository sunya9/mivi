import { expect, test } from "vitest";
import { screen } from "@testing-library/react";

test("should render the app", { timeout: 10000 }, async () => {
  const container = document.createElement("div");
  container.id = "root";
  document.body.appendChild(container);
  await import("../src/main");
  const app = await screen.findByRole("application");
  expect(app).toBeInTheDocument();
});
