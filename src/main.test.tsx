import { expect, test } from "vitest";
import { screen } from "@testing-library/react";

test("should render the app", async () => {
  const container = document.createElement("div");
  container.id = "root";
  document.body.appendChild(container);
  await import("./main");
  const app = await screen.findByRole("application");
  expect(app).toBeInTheDocument();
});
