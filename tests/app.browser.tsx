import { expect, test, vi } from "vitest";
import { App } from "@/app";
import { customPageRender } from "./browser.util";
import { commands, userEvent } from "vitest/browser";
import { fireEvent } from "@testing-library/react";
import "@/index.css";

vi.spyOn(console, "error").mockImplementation(() => {});

test("complete happy path", async () => {
  // TODO: add more assertions
  const screen = await customPageRender(<App />);
  await expect
    .element(screen.getByRole("heading", { name: "MiVi", level: 1 }))
    .toBeInTheDocument();

  // Get file inputs by their aria-label (now using placeholder as label)
  await userEvent.upload(
    screen.getByLabelText("Choose MIDI file"),
    "./tests/fixtures/test.mid",
  );
  await userEvent.upload(
    screen.getByLabelText("Choose Audio file"),
    "./tests/fixtures/test.mp3",
  );
  const colorInputElement = screen.getByLabelText("Note color");
  fireEvent.input(colorInputElement.element(), {
    target: { value: "#ffffff" },
  });

  // Change format to webm (mp4 is not supported in CI environment)
  const formatTrigger = screen.getByRole("combobox", { name: "Format" });
  await formatTrigger.click();
  const webmOption = screen.getByRole("option", { name: "WebM (VP9)" });
  await webmOption.click();

  const downloadPromise = commands.waitForDownload();
  await screen.getByRole("button", { name: "Start export" }).click();
  await expect.element(screen.getByText("Exporting…")).toBeInTheDocument();
  const download = await downloadPromise;
  // @ts-expect-error: ???
  expect(download._suggestedFilename).toBe("mivi-test.mid.webm");
});
