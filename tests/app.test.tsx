import { expect, test } from "vitest";
import { App } from "@/app";
import { customRender } from "./util";
import { screen, waitFor } from "@testing-library/react";

test("should render App component", async () => {
  customRender(<App />);
  await waitFor(() => {
    expect(screen.getByText("MiVi")).toBeInTheDocument();
  });
});
