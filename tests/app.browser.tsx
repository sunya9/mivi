import { expect, test, vi } from "vitest";
import { App } from "@/app";
import { customPageRender } from "./browser.util";
import { commands, userEvent } from "vitest/browser";
import { fireEvent } from "@testing-library/react";
import "@/index.css";
import { toast } from "sonner";

vi.spyOn(console, "error").mockImplementation(() => {});

test("complete happy path on desktop", async () => {
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
  const colorPickerElement = screen.getByLabelText("Note color picker");
  fireEvent.input(colorPickerElement.element(), {
    target: { value: "#ff0000" },
  });

  // Change format to webm (mp4 is not supported in CI environment)
  const formatTrigger = screen.getByRole("combobox", { name: "Format" });
  await formatTrigger.click();
  const webmOption = screen.getByRole("option", { name: "WebM (VP9)" });
  await webmOption.click();

  const downloadPromise = commands.waitForDownload();
  await screen.getByRole("button", { name: "Start export" }).click();
  // During export, the button shows "Stop export" with a spinner
  await expect
    .element(screen.getByRole("button", { name: /Stop export/ }))
    .toBeInTheDocument();
  const download = await downloadPromise;
  // @ts-expect-error: ???
  expect(download._suggestedFilename).toBe("mivi-test.mid.webm");
});

test("complete happy path on mobile", async () => {
  // TODO: add more assertions
  const screen = await customPageRender(<App />, {
    viewport: { width: 375, height: 667 },
  });
  await expect
    .element(screen.getByRole("heading", { name: "MiVi", level: 1 }))
    .toBeInTheDocument();

  // Switch to Tracks tab and upload MIDI file
  await screen.getByRole("tab", { name: "Tracks" }).click();
  await userEvent.upload(
    screen.getByLabelText("Choose MIDI file"),
    "./tests/fixtures/test.mid",
  );

  // Change note color (track item appears after MIDI upload)
  await expect
    .element(screen.getByLabelText("Note color picker"))
    .toBeInTheDocument();
  const colorPickerElement = screen.getByLabelText("Note color picker");
  fireEvent.input(colorPickerElement.element(), {
    target: { value: "#ff0000" },
  });

  // Switch to Audio/Bg tab and upload audio file
  await screen.getByRole("tab", { name: "Audio/Bg" }).click();
  await userEvent.upload(
    screen.getByLabelText("Choose Audio file"),
    "./tests/fixtures/test.mp3",
  );

  // Change format to webm (mp4 is not supported in CI environment)
  const formatTrigger = screen.getByRole("combobox", { name: "Format" });
  await formatTrigger.click();
  const webmOption = screen.getByRole("option", { name: "WebM (VP9)" });
  await webmOption.click();

  expect(screen.getByRole("list")).toBeInTheDocument();
  // Dismiss all programmatically shown toast notifications
  toast.dismiss();
  await expect.element(screen.getByRole("list")).not.toBeInTheDocument();

  const downloadPromise = commands.waitForDownload();
  await screen.getByRole("button", { name: "Start export" }).click();
  // During export, the button shows "Stop export" with a spinner
  await expect
    .element(screen.getByRole("button", { name: /Stop export/ }))
    .toBeInTheDocument();
  const download = await downloadPromise;
  // @ts-expect-error: ???
  expect(download._suggestedFilename).toBe("mivi-test.mid.webm");
});
