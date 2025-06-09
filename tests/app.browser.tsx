/// <reference types="@vitest/browser/providers/playwright" />
import { expect, test, vi } from "vitest";
import { App } from "@/app";
import { customPageRender } from "./browser.util";
import { commands, userEvent } from "@vitest/browser/context";
import "@/index.css";

vi.spyOn(console, "error").mockImplementation(() => {});

test("complete happy path", async () => {
  // TODO: add more assertions
  const screen = customPageRender(<App />);
  await expect.element(screen.getByText("MiVi")).toBeInTheDocument();
  await userEvent.upload(
    screen.getByLabelText("Open MIDI file"),
    "./tests/fixtures/test.mid",
  );
  await userEvent.upload(
    screen.getByLabelText("Open Audio file"),
    "./tests/fixtures/test.mp3",
  );
  const downloadPromise = commands.waitForDownload();
  await screen.getByRole("button", { name: "Start export" }).click();
  await expect.element(screen.getByText("Exporting…")).toBeInTheDocument();
  const download = await downloadPromise;
  // @ts-expect-error: ???
  expect(download._suggestedFilename).toBe("mivi-test.mid.webm");
});
