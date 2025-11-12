import { expect, test, vi, beforeEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { CommonConfigPane } from "@/components/app/common-config-pane";
import { resolutions } from "@/lib/renderers/renderer";
import { customRender } from "tests/util";
import userEvent from "@testing-library/user-event";
import { rendererConfig } from "tests/fixtures";
import { ComponentProps } from "react";

const mockOnChangeAudioFile = vi.fn();
const mockOnUpdateRendererConfig = vi.fn();
const mockOnChangeBackgroundImage = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

function renderCommonConfigPane(
  props: Partial<ComponentProps<typeof CommonConfigPane>> = {},
) {
  return customRender(
    <CommonConfigPane
      rendererConfig={rendererConfig}
      onChangeAudioFile={mockOnChangeAudioFile}
      onUpdateRendererConfig={mockOnUpdateRendererConfig}
      onChangeBackgroundImage={mockOnChangeBackgroundImage}
      audioFilename="test.mp3"
      backgroundImageFilename="test.png"
      {...props}
    />,
  );
}

test("should render basic layout", () => {
  renderCommonConfigPane();
  expect(screen.getByText("Audio Settings")).toBeInTheDocument();
  expect(screen.getByText("Common settings")).toBeInTheDocument();
  const footerParagraph = screen.getByText(/Created by/);
  expect(footerParagraph).toBeInTheDocument();

  expect(
    screen.getByRole("link", { name: "@ephemeralMocha" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Repository" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Switch theme to dark" }),
  ).toBeInTheDocument();
});

test("should call onChangeAudioFile when audio file is selected", () => {
  renderCommonConfigPane();
  const audioFileInput = screen.getByLabelText("Choose Audio file");
  const file = new File(["test"], "test.mp3", { type: "audio/mpeg" });
  fireEvent.change(audioFileInput, { target: { files: [file] } });
  expect(mockOnChangeAudioFile).toHaveBeenCalledExactlyOnceWith(file);
});

test("not call onChangeAudioFile when file is not selected", () => {
  renderCommonConfigPane();
  const audioFileInput = screen.getByLabelText("Choose Audio file");
  fireEvent.change(audioFileInput, { target: { files: [] } });
  expect(mockOnChangeAudioFile).not.toHaveBeenCalled();
});

test("should call onUpdateRendererConfig when background color is changed", () => {
  renderCommonConfigPane();
  const colorInput = screen.getByLabelText("Background Color");
  fireEvent.change(colorInput, { target: { value: "#ffffff" } });
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    backgroundColor: "#ffffff",
  });
});

test("should call onUpdateRendererConfig when resolution is changed", async () => {
  renderCommonConfigPane();
  const resolutionTrigger = screen.getByRole("combobox", {
    name: "Resolution",
  });
  await userEvent.click(resolutionTrigger);
  const resolutionOption = screen.getByRole("option", {
    name: resolutions[0].label,
  });
  await userEvent.click(resolutionOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    resolution: resolutions[0],
  });
});

test("should call onUpdateRendererConfig when FPS is changed", async () => {
  renderCommonConfigPane();
  const fpsTrigger = screen.getByRole("combobox", { name: "FPS" });
  await userEvent.click(fpsTrigger);
  const fpsOption = screen.getByRole("option", { name: "60 fps" });
  await userEvent.click(fpsOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    fps: 60,
  });
});

test("should call onUpdateRendererConfig when format is changed", async () => {
  renderCommonConfigPane();
  const formatTrigger = screen.getByRole("combobox", { name: "Format" });
  await userEvent.click(formatTrigger);
  const formatOption = screen.getByRole("option", { name: "MP4 (H.264)" });
  await userEvent.click(formatOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    format: "mp4",
  });
});

test("should call onChangeBackgroundImage when background image is selected", () => {
  renderCommonConfigPane();
  const backgroundImageInput = screen.getByLabelText("Choose Background Image");
  const file = new File(["test"], "test.png", { type: "image/png" });
  fireEvent.change(backgroundImageInput, { target: { files: [file] } });
  expect(mockOnChangeBackgroundImage).toHaveBeenCalledExactlyOnceWith(file);
});

test("should call onUpdateRendererConfig when background image fit is changed", async () => {
  renderCommonConfigPane();
  const fitTrigger = screen.getByRole("combobox", { name: "Image Fit" });
  await userEvent.click(fitTrigger);
  const fitOption = screen.getByRole("option", { name: "Contain" });
  await userEvent.click(fitOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    backgroundImageFit: "contain",
  });
});

test("should call onUpdateRendererConfig when background image position is changed", async () => {
  renderCommonConfigPane();
  const positionTrigger = screen.getByRole("combobox", {
    name: "Image Position",
  });
  await userEvent.click(positionTrigger);
  const positionOption = screen.getByRole("option", { name: "Top Left" });
  await userEvent.click(positionOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    backgroundImagePosition: "top-left",
  });
});

test("should call onUpdateRendererConfig when background image repeat is changed", async () => {
  renderCommonConfigPane();
  const repeatTrigger = screen.getByRole("combobox", { name: "Image Repeat" });
  await userEvent.click(repeatTrigger);
  const repeatOption = screen.getByRole("option", { name: "Repeat" });
  await userEvent.click(repeatOption);
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    backgroundImageRepeat: "repeat",
  });
});

test("should call onUpdateRendererConfig when background image opacity is changed", async () => {
  renderCommonConfigPane();
  const opacitySlider = screen.getByRole("slider", { name: /Image Opacity/ });
  await userEvent.click(opacitySlider);
  await userEvent.keyboard("{arrowleft}");
  expect(mockOnUpdateRendererConfig).toHaveBeenCalledExactlyOnceWith({
    backgroundImageOpacity: 0.99,
  });
});

test("should clear background image when cancel button is clicked", async () => {
  renderCommonConfigPane({ backgroundImageFilename: "test.png" });

  const cancelButton = screen.getByRole("button", {
    name: "Cancel background image",
  });
  await userEvent.click(cancelButton);
  expect(mockOnChangeBackgroundImage).toHaveBeenCalledExactlyOnceWith(
    undefined,
  );
});

test("should not show background image settings when no image is selected", () => {
  renderCommonConfigPane({ backgroundImageFilename: undefined });

  expect(
    screen.queryByRole("combobox", { name: "Image Fit" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Image Position" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Image Repeat" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("slider", { name: /Image Opacity/ }),
  ).not.toBeInTheDocument();
});
