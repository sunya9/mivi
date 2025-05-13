import { expect, test, vi } from "vitest";
import { App } from "@/app";
import { customRender } from "./util";
import { page, userEvent } from "@vitest/browser/context";

vi.spyOn(console, "error").mockImplementation(() => {});

test("complete happy path", async () => {
  // TODO: add more assertions
  customRender(<App />);
  await expect.element(page.getByText("MiVi")).toBeInTheDocument();
  await userEvent.upload(
    page.getByLabelText("Open MIDI file"),
    "./fixtures/test.mid",
  );
  await userEvent.upload(
    page.getByLabelText("Open Audio file"),
    "./fixtures/test.mp3",
  );
  await page.getByRole("button", { name: "Start export" }).click();
  await expect.element(page.getByText("Exporting…")).toBeInTheDocument();
});
