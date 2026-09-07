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
