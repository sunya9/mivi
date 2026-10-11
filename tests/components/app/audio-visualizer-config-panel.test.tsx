import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { rendererConfig } from "tests/fixtures";
import { chooseAnotherOption, customRender, nudgeSlider, pickColor } from "tests/util";
import { expect, test, vi } from "vitest";

import { AudioVisualizerConfigPanel } from "@/components/app/audio-visualizer-config-panel";

type Props = ComponentProps<typeof AudioVisualizerConfigPanel>;
const onChange = vi.fn<Props["onChange"]>();
const audioVisualizerConfig = rendererConfig.audioVisualizerConfig;

async function renderPane(overrideProps?: Partial<Props>) {
  await customRender(
    <AudioVisualizerConfigPanel
      style="bars"
      onChange={onChange}
      config={audioVisualizerConfig}
      {...overrideProps}
    />,
  );
}

test("should show position selector when style is bars", async () => {
  await renderPane();
  expect(screen.getByRole("combobox", { name: "Position" })).toBeInTheDocument();
});

test("position options should be in order: Top, Center, Bottom", async () => {
  await renderPane();
  const positionTrigger = screen.getByRole("combobox", { name: "Position" });
  await userEvent.click(positionTrigger);

  const options = screen.getAllByRole("option");
  expect(options[0]).toHaveTextContent("Top");
  expect(options[1]).toHaveTextContent("Center");
  expect(options[2]).toHaveTextContent("Bottom");
});

test("should call onChange when position is changed", async () => {
  await renderPane();
  const positionTrigger = screen.getByRole("combobox", { name: "Position" });
  await userEvent.click(positionTrigger);
  const topOption = screen.getByRole("option", { name: "Top" });
  await userEvent.click(topOption);
  expect(onChange).toHaveBeenCalledWith({ position: "top" });
});

test("should show bar count slider when style is bars", async () => {
  await renderPane();
  expect(screen.getByText(/Bar Count:/)).toBeInTheDocument();
});

test("should show mirror switch when style is enabled", async () => {
  await renderPane();
  expect(screen.getByRole("switch", { name: "Mirror" })).toBeInTheDocument();
});

test("should toggle mirror when switch is clicked", async () => {
  await renderPane({ config: { ...audioVisualizerConfig, mirror: false } });
  const switchEl = screen.getByRole("switch", { name: "Mirror" });
  await userEvent.click(switchEl);
  expect(onChange).toHaveBeenCalledWith({ mirror: true });
});

test("should show use gradient switch when style is enabled", async () => {
  await renderPane();
  expect(screen.getByRole("switch", { name: "Use Gradient" })).toBeInTheDocument();
});

test("should show gradient direction when use gradient is enabled", async () => {
  await renderPane({ config: { ...audioVisualizerConfig, useGradient: true } });
  expect(screen.getByRole("combobox", { name: "Gradient Direction" })).toBeInTheDocument();
});

test("should show single color picker when use gradient is disabled", async () => {
  await renderPane({ config: { ...audioVisualizerConfig, useGradient: false } });
  expect(screen.getByRole("textbox", { name: "Color" })).toBeInTheDocument();
});

// Line Spectrum specific tests
test("should show line spectrum settings when style is lineSpectrum", async () => {
  await renderPane({ style: "lineSpectrum" });
  expect(screen.getByText(/Smoothness:/)).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Stroke" })).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Fill" })).toBeInTheDocument();
});

test("should show stroke color picker when stroke is enabled for lineSpectrum", async () => {
  await renderPane({
    style: "lineSpectrum",
    config: {
      ...audioVisualizerConfig,
      lineSpectrumConfig: { ...audioVisualizerConfig.lineSpectrumConfig, stroke: true },
    },
  });
  expect(screen.getByRole("textbox", { name: "Stroke Color" })).toBeInTheDocument();
});

test("should not show stroke color picker when stroke is disabled", async () => {
  await renderPane({
    style: "lineSpectrum",
    config: {
      ...audioVisualizerConfig,
      lineSpectrumConfig: { ...audioVisualizerConfig.lineSpectrumConfig, stroke: false },
    },
  });
  expect(screen.queryByRole("textbox", { name: "Stroke Color" })).not.toBeInTheDocument();
});

// Circular specific tests
test("should not show position selector when style is circular", async () => {
  await renderPane({ style: "circular" });
  expect(screen.queryByRole("combobox", { name: "Position" })).not.toBeInTheDocument();
});

test("should show size label instead of height when style is circular", async () => {
  await renderPane({ style: "circular" });
  expect(screen.getByText(/Size:/)).toBeInTheDocument();
});

const barsConfig = {
  ...audioVisualizerConfig,
  mirror: true,
  useGradient: true,
};

const lineSpectrumConfig = {
  ...audioVisualizerConfig,
  lineSpectrumConfig: { ...audioVisualizerConfig.lineSpectrumConfig, stroke: true, fill: true },
};

test.each([
  [/^Bar Count/, "barCount"],
  [/^Gap/, "barGap"],
  [/^Padding/, "barPadding"],
  [/^Min Height/, "barMinHeight"],
  [/^Opacity/, "barOpacity"],
  [/^Height/, "height"],
  [/^Mirror Opacity/, "mirrorOpacity"],
  [/^Attack/, "attackTime"],
  [/^Release/, "releaseTime"],
])("%s slider updates %s for bars", async (label, key) => {
  await renderPane({ config: barsConfig });
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: expect.any(Number) }));
});

test.each([
  [/^Smoothness/, "tension"],
  [/^Line Width/, "lineWidth"],
  [/^Stroke Opacity/, "strokeOpacity"],
  [/^Fill Opacity/, "fillOpacity"],
])("%s slider updates lineSpectrumConfig.%s", async (label, key) => {
  await renderPane({ style: "lineSpectrum", config: lineSpectrumConfig });
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith({
    lineSpectrumConfig: expect.objectContaining({ [key]: expect.any(Number) }),
  });
});

test.each([
  ["Stroke", "stroke"],
  ["Fill", "fill"],
])("%s switch updates lineSpectrumConfig.%s", async (label, key) => {
  await renderPane({ style: "lineSpectrum", config: lineSpectrumConfig });
  await userEvent.click(screen.getByRole("switch", { name: label }));
  expect(onChange).toHaveBeenLastCalledWith({
    lineSpectrumConfig: { ...lineSpectrumConfig.lineSpectrumConfig, [key]: false },
  });
});

test("stroke color picker updates lineSpectrumConfig.strokeColor", async () => {
  await renderPane({ style: "lineSpectrum", config: lineSpectrumConfig });
  pickColor("Stroke Color", "#123456");
  expect(onChange).toHaveBeenLastCalledWith({
    lineSpectrumConfig: { ...lineSpectrumConfig.lineSpectrumConfig, strokeColor: "#123456" },
  });
});

test.each([
  ["Bar Style", "barStyle"],
  ["Gradient Direction", "gradientDirection"],
])("%s select updates %s", async (label, key) => {
  await renderPane({ config: barsConfig });
  await chooseAnotherOption(label);
  expect(onChange).toHaveBeenLastCalledWith({ [key]: expect.any(String) });
});

test("use gradient switch updates useGradient", async () => {
  await renderPane({ config: barsConfig });
  await userEvent.click(screen.getByRole("switch", { name: "Use Gradient" }));
  expect(onChange).toHaveBeenLastCalledWith({ useGradient: false });
});

test.each([
  ["Gradient Start Color", "gradientStartColor"],
  ["Gradient End Color", "gradientEndColor"],
])("%s picker updates %s", async (label, key) => {
  await renderPane({ config: barsConfig });
  pickColor(label, "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ [key]: "#123456" });
});

test("single color picker updates singleColor", async () => {
  await renderPane({ config: { ...barsConfig, useGradient: false } });
  pickColor("Color", "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ singleColor: "#123456" });
});
