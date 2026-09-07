import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioContext } from "standardized-audio-context-mock";
import { customRender } from "tests/util";
import { beforeEach, expect, test, vi } from "vitest";

import { CommonConfigPane } from "@/components/app/common-config-pane";
import { createAppContext } from "@/contexts/app-context";
import { fileDecoders } from "@/contexts/file-decoders";
import type { SerializedAudio } from "@/lib/audio/audio";
import { resolutions } from "@/lib/renderers/renderer";

const backgroundImageFile = new File(["test"], "test.png", { type: "image/png" });

const serializedAudio: SerializedAudio = {
  channels: [new Int16Array(1)],
  sampleRate: 44100,
  length: 1,
  numberOfChannels: 1,
  duration: 1 / 44100,
};

vi.mock("@/contexts/file-decoders", { spy: true });

beforeEach(async () => {
  const bitmap = await createImageBitmap(new OffscreenCanvas(1, 1));
  vi.mocked(fileDecoders.backgroundImage).mockResolvedValue(bitmap);
  vi.mocked(fileDecoders.audio).mockResolvedValue(serializedAudio);
});

async function renderCommonConfigPane({
  withBackgroundImage = true,
}: { withBackgroundImage?: boolean } = {}) {
  const appContextValue = createAppContext(new AudioContext());
  const backgroundImage = appContextValue.fileStore.backgroundImage;
  if (withBackgroundImage) {
    await backgroundImage.setFile(backgroundImageFile);
  }
  const view = await customRender(<CommonConfigPane />, { appContextValue });
  return {
    ...view,
    config: () => appContextValue.rendererConfigStore.getSnapshot(),
    backgroundImageFile: () => backgroundImage.getSnapshot().file,
    audioFile: () => appContextValue.fileStore.audio.getSnapshot().file,
  };
}

test("should render basic layout", async () => {
  await renderCommonConfigPane();
  expect(screen.getByText("Audio Settings")).toBeInTheDocument();
  expect(screen.getByText("Common settings")).toBeInTheDocument();
});

test("should store the selected audio file", async () => {
  const { audioFile } = await renderCommonConfigPane();
  const audioFileInput = screen.getByLabelText("Choose Audio file");
  const file = new File(["test"], "test.mp3", { type: "audio/mpeg" });
  fireEvent.change(audioFileInput, { target: { files: [file] } });
  await waitFor(() => expect(audioFile()).toBe(file));
});

test("does not store anything when no audio file is selected", async () => {
  const { audioFile } = await renderCommonConfigPane();
  const audioFileInput = screen.getByLabelText("Choose Audio file");
  fireEvent.change(audioFileInput, { target: { files: [] } });
  expect(audioFile()).toBeUndefined();
});

test("should update the store when background color is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const colorInput = screen.getByLabelText("Color picker");
  fireEvent.input(colorInput, { target: { value: "#ffffff" } });
  expect(config().backgroundColor).toEqual("#ffffff");
});

test("should update the store when resolution is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const resolutionTrigger = screen.getByRole("combobox", {
    name: "Resolution",
  });
  await userEvent.click(resolutionTrigger);
  const resolutionOption = screen.getByRole("option", {
    name: resolutions[0].label,
  });
  await userEvent.click(resolutionOption);
  expect(config().resolution).toEqual(resolutions[0]);
});

test("should update the store when FPS is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const fpsTrigger = screen.getByRole("combobox", { name: "FPS" });
  await userEvent.click(fpsTrigger);
  const fpsOption = screen.getByRole("option", { name: "60 fps" });
  await userEvent.click(fpsOption);
  expect(config().fps).toEqual(60);
});

test("should update the store when format is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const formatTrigger = screen.getByRole("combobox", { name: "Format" });
  await userEvent.click(formatTrigger);
  const formatOption = screen.getByRole("option", { name: "WebM (VP9)" });
  await userEvent.click(formatOption);
  expect(config().format).toEqual("webm");
});

test("should store the selected background image", async () => {
  const { backgroundImageFile: storedFile } = await renderCommonConfigPane({
    withBackgroundImage: false,
  });
  const backgroundImageInput = screen.getByLabelText("Choose Background Image");
  const file = new File(["next"], "next.png", { type: "image/png" });
  fireEvent.change(backgroundImageInput, { target: { files: [file] } });
  await waitFor(() => expect(storedFile()).toBe(file));
});

test("should update the store when background image fit is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const fitTrigger = screen.getByRole("combobox", { name: "Image Fit" });
  await userEvent.click(fitTrigger);
  const fitOption = screen.getByRole("option", { name: "Contain" });
  await userEvent.click(fitOption);
  expect(config().backgroundImageFit).toEqual("contain");
});

test("should update the store when background image position is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const positionTrigger = screen.getByRole("combobox", {
    name: "Image Position",
  });
  await userEvent.click(positionTrigger);
  const positionOption = screen.getByRole("option", { name: "Top Left" });
  await userEvent.click(positionOption);
  expect(config().backgroundImagePosition).toEqual("top-left");
});

test("should update the store when background image repeat is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const repeatTrigger = screen.getByRole("combobox", { name: "Image Repeat" });
  await userEvent.click(repeatTrigger);
  const repeatOption = screen.getByRole("option", { name: "Repeat" });
  await userEvent.click(repeatOption);
  expect(config().backgroundImageRepeat).toEqual("repeat");
});

test("should update the store when background image opacity is changed", async () => {
  const { config } = await renderCommonConfigPane();
  const group = screen.getByRole("group", { name: /Image Opacity/ });
  const opacitySlider = within(group).getByRole("slider", { hidden: true });
  opacitySlider.focus();
  await userEvent.keyboard("{arrowleft}");
  expect(config().backgroundImageOpacity).toEqual(0.99);
});

test("should clear background image when cancel button is clicked", async () => {
  const { backgroundImageFile: storedFile } = await renderCommonConfigPane();

  const cancelButton = screen.getByRole("button", {
    name: "Cancel background image",
  });
  await userEvent.click(cancelButton);
  await waitFor(() => expect(storedFile()).toBeUndefined());
});

test("should not show background image settings when no image is selected", async () => {
  await renderCommonConfigPane({ withBackgroundImage: false });

  expect(screen.queryByRole("combobox", { name: "Image Fit" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "Image Position" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "Image Repeat" })).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: /Image Opacity/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("switch", { name: "Show Background Image" })).not.toBeInTheDocument();
});

test("should update the store when background image enabled is toggled", async () => {
  const { config } = await renderCommonConfigPane();
  const enabledSwitch = screen.getByRole("switch", {
    name: "Show Background Image",
  });
  expect(enabledSwitch).toBeInTheDocument();
  await userEvent.click(enabledSwitch);
  expect(config().backgroundImageEnabled).toEqual(false);
});

test("should show background image toggle when image is selected", async () => {
  await renderCommonConfigPane();
  expect(screen.getByRole("switch", { name: "Show Background Image" })).toBeInTheDocument();
});

async function selectResolution(name: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Resolution" }));
  await userEvent.click(screen.getByRole("option", { name }));
}

test("should group resolution presets by orientation", async () => {
  await renderCommonConfigPane();
  await userEvent.click(screen.getByRole("combobox", { name: "Resolution" }));
  const listbox = screen.getByRole("listbox");
  expect(within(listbox).getByText("Landscape")).toBeInTheDocument();
  expect(within(listbox).getByText("Portrait")).toBeInTheDocument();
  expect(within(listbox).getByText("Square")).toBeInTheDocument();
  expect(within(listbox).getByRole("option", { name: "1080×1920 (9:16)" })).toBeInTheDocument();
  expect(within(listbox).getByRole("option", { name: "Custom" })).toBeInTheDocument();
});

test("should not show custom size inputs while a preset is selected", async () => {
  await renderCommonConfigPane();
  expect(screen.queryByRole("spinbutton", { name: "Width" })).not.toBeInTheDocument();
});

test("should seed custom size inputs with the previously selected resolution", async () => {
  const { config } = await renderCommonConfigPane();
  const before = config().resolution;
  await selectResolution("Custom");
  expect(config().resolution).toEqual({ ...before, label: "Custom" });
  expect(screen.getByRole("spinbutton", { name: "Width" })).toHaveValue(before.width);
  expect(screen.getByRole("spinbutton", { name: "Height" })).toHaveValue(before.height);
});

test("should move focus into the width input when Custom is picked", async () => {
  await renderCommonConfigPane();
  await selectResolution("Custom");
  expect(screen.getByRole("spinbutton", { name: "Width" })).toHaveFocus();
});

test("should return focus to the trigger when the popup is dismissed while Custom is active", async () => {
  await renderCommonConfigPane();
  await selectResolution("Custom");
  const trigger = screen.getByRole("combobox", { name: "Resolution" });
  await userEvent.click(trigger);
  await userEvent.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});

test("should return focus to the trigger when a preset is picked", async () => {
  await renderCommonConfigPane();
  await selectResolution("Custom");
  await selectResolution("1080×1920 (9:16)");
  expect(screen.getByRole("combobox", { name: "Resolution" })).toHaveFocus();
});

test("should commit a normalized custom size on blur", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  const width = screen.getByRole("spinbutton", { name: "Width" });
  await userEvent.clear(width);
  await userEvent.type(width, "1001");
  expect(config().resolution.width).toBe(1280);
  await userEvent.tab();
  expect(config().resolution.width).toBe(1002);
  expect(width).toHaveValue(1002);
});

test("should commit a custom size on Enter", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  const height = screen.getByRole("spinbutton", { name: "Height" });
  await userEvent.clear(height);
  await userEvent.type(height, "900{Enter}");
  expect(config().resolution.height).toBe(900);
});

test("should parse decimal and exponent input as full numbers", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  const width = screen.getByRole("spinbutton", { name: "Width" });
  await userEvent.clear(width);
  await userEvent.type(width, "1000.5{Enter}");
  expect(config().resolution.width).toBe(1002);
  await userEvent.clear(width);
  await userEvent.type(width, "1e3{Enter}");
  expect(config().resolution.width).toBe(1000);
});

test("should restore the last committed size when the input is left empty", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  const width = screen.getByRole("spinbutton", { name: "Width" });
  await userEvent.clear(width);
  await userEvent.tab();
  expect(config().resolution.width).toBe(1280);
  expect(width).toHaveValue(1280);
});

test("should restore the last custom size when Custom is picked again", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  const width = screen.getByRole("spinbutton", { name: "Width" });
  await userEvent.clear(width);
  await userEvent.type(width, "1000{Enter}");
  await selectResolution("1080×1920 (9:16)");
  await selectResolution("Custom");
  expect(config().resolution).toEqual({ width: 1000, height: 720, label: "Custom" });
  expect(screen.getByRole("spinbutton", { name: "Width" })).toHaveValue(1000);
});

test("should persist the custom size separately from the active resolution", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  const height = screen.getByRole("spinbutton", { name: "Height" });
  await userEvent.clear(height);
  await userEvent.type(height, "900{Enter}");
  await selectResolution("1080×1920 (9:16)");
  expect(config().customResolution).toEqual({ width: 1280, height: 900, label: "Custom" });
});

test("should hide custom size inputs again when a preset is picked", async () => {
  const { config } = await renderCommonConfigPane();
  await selectResolution("Custom");
  await selectResolution("1080×1920 (9:16)");
  expect(config().resolution).toMatchObject({ width: 1080, height: 1920 });
  expect(screen.queryByRole("spinbutton", { name: "Width" })).not.toBeInTheDocument();
});
