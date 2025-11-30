import { expect, test, vi } from "vitest";
import { App } from "@/app";
import { customPageRender } from "./browser.util";
import { commands, userEvent } from "vitest/browser";
import "@/index.css";

vi.spyOn(console, "error").mockImplementation(() => {});

test("complete happy path", async () => {
  // TODO: add more assertions
  const screen = await customPageRender(<App />);
  await expect.element(screen.getByText("MiVi")).toBeInTheDocument();

  // Get file inputs by their aria-label (now using placeholder as label)
  await userEvent.upload(
    screen.getByLabelText("Choose MIDI file"),
    "./tests/fixtures/test.mid",
  );
  await userEvent.upload(
    screen.getByLabelText("Choose Audio file"),
    "./tests/fixtures/test.mp3",
  );
  const downloadPromise = commands.waitForDownload();
  await screen.getByRole("button", { name: "Start export" }).click();
  await expect.element(screen.getByText("Exporting…")).toBeInTheDocument();
  const download = await downloadPromise;
  // @ts-expect-error: ???
  expect(download._suggestedFilename).toBe("mivi-test.mid.webm");
});
