import { screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { AudioVisualizerConfigPanel } from "@/components/app/audio-visualizer-config-panel";
import { customRender } from "tests/util";
import { rendererConfig } from "tests/fixtures";
import { ComponentProps } from "react";
import userEvent from "@testing-library/user-event";

type Props = ComponentProps<typeof AudioVisualizerConfigPanel>;
const onUpdateRendererConfig: Props["onUpdateRendererConfig"] = vi.fn();
const audioVisualizerConfig = rendererConfig.audioVisualizerConfig;

function renderPane(overrideProps?: Partial<Props>) {
  customRender(
    <AudioVisualizerConfigPanel
      onUpdateRendererConfig={onUpdateRendererConfig}
      audioVisualizerConfig={audioVisualizerConfig}
      {...overrideProps}
    />,
  );
}

// Render tests
test("renders style selector", () => {
  renderPane();
  expect(screen.getByRole("combobox", { name: "Style" })).toBeInTheDocument();
});

test("should change style when style is selected", async () => {
  renderPane();
  const styleTrigger = screen.getByRole("combobox", { name: "Style" });
  await userEvent.click(styleTrigger);
  const barsOption = screen.getByRole("option", { name: "Bars" });
  await userEvent.click(barsOption);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    audioVisualizerConfig: { style: "bars" },
  });
});

test("should not show position selector when style is none", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "none" },
  });
  expect(
    screen.queryByRole("combobox", { name: "Position" }),
  ).not.toBeInTheDocument();
});

test("should show position selector when style is bars", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "bars" },
  });
  expect(
    screen.getByRole("combobox", { name: "Position" }),
  ).toBeInTheDocument();
});

test("position options should be in order: Top, Center, Bottom", async () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "bars" },
  });
  const positionTrigger = screen.getByRole("combobox", { name: "Position" });
  await userEvent.click(positionTrigger);

  const options = screen.getAllByRole("option");
  expect(options[0]).toHaveTextContent("Top");
  expect(options[1]).toHaveTextContent("Center");
  expect(options[2]).toHaveTextContent("Bottom");
});

test("should call onUpdateRendererConfig when position is changed", async () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "bars" },
  });
  const positionTrigger = screen.getByRole("combobox", { name: "Position" });
  await userEvent.click(positionTrigger);
  const topOption = screen.getByRole("option", { name: "Top" });
  await userEvent.click(topOption);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    audioVisualizerConfig: { position: "top" },
  });
});

test("should show bar count slider when style is bars", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "bars" },
  });
  expect(screen.getByText(/Bar Count:/)).toBeInTheDocument();
});

test("should show mirror switch when style is enabled", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "bars" },
  });
  expect(screen.getByRole("switch", { name: "Mirror" })).toBeInTheDocument();
});

test("should toggle mirror when switch is clicked", async () => {
  renderPane({
    audioVisualizerConfig: {
      ...audioVisualizerConfig,
      style: "bars",
      mirror: false,
    },
  });
  const switchEl = screen.getByRole("switch", { name: "Mirror" });
  await userEvent.click(switchEl);
  expect(onUpdateRendererConfig).toHaveBeenCalledWith({
    audioVisualizerConfig: { mirror: true },
  });
});

test("should show use gradient switch when style is enabled", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "bars" },
  });
  expect(
    screen.getByRole("switch", { name: "Use Gradient" }),
  ).toBeInTheDocument();
});

test("should show gradient direction when use gradient is enabled", () => {
  renderPane({
    audioVisualizerConfig: {
      ...audioVisualizerConfig,
      style: "bars",
      useGradient: true,
    },
  });
  expect(
    screen.getByRole("combobox", { name: "Gradient Direction" }),
  ).toBeInTheDocument();
});

test("should show single color picker when use gradient is disabled", () => {
  renderPane({
    audioVisualizerConfig: {
      ...audioVisualizerConfig,
      style: "bars",
      useGradient: false,
    },
  });
  expect(screen.getByLabelText("Color")).toBeInTheDocument();
});

// Line Spectrum specific tests
test("should show line spectrum settings when style is lineSpectrum", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "lineSpectrum" },
  });
  expect(screen.getByText(/Smoothness:/)).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Stroke" })).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Fill" })).toBeInTheDocument();
});

test("should show stroke color picker when stroke is enabled for lineSpectrum", () => {
  renderPane({
    audioVisualizerConfig: {
      ...audioVisualizerConfig,
      style: "lineSpectrum",
      lineSpectrumConfig: {
        ...audioVisualizerConfig.lineSpectrumConfig,
        stroke: true,
      },
    },
  });
  expect(screen.getByLabelText("Stroke Color")).toBeInTheDocument();
});

test("should not show stroke color picker when stroke is disabled", () => {
  renderPane({
    audioVisualizerConfig: {
      ...audioVisualizerConfig,
      style: "lineSpectrum",
      lineSpectrumConfig: {
        ...audioVisualizerConfig.lineSpectrumConfig,
        stroke: false,
      },
    },
  });
  expect(screen.queryByLabelText("Stroke Color")).not.toBeInTheDocument();
});

// Circular specific tests
test("should not show position selector when style is circular", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "circular" },
  });
  expect(
    screen.queryByRole("combobox", { name: "Position" }),
  ).not.toBeInTheDocument();
});

test("should show size label instead of height when style is circular", () => {
  renderPane({
    audioVisualizerConfig: { ...audioVisualizerConfig, style: "circular" },
  });
  // For circular, the height slider shows "Size" instead of "Height"
  expect(screen.getByText(/Size:/)).toBeInTheDocument();
});
