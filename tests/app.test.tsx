import { screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";

import { App } from "@/app";

import { customRender } from "./util";

test("should render App component", async () => {
  await customRender(<App />);
  await waitFor(() => {
    expect(screen.getByText("MiVi")).toBeInTheDocument();
  });
});
