import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { rendererConfig } from "tests/fixtures";
import { customRender, nudgeSlider, pickColor } from "tests/util";
import { expect, test, vi } from "vitest";

import { LineSpectrumConfigPanel } from "@/components/app/line-spectrum-config-panel";

type Props = ComponentProps<typeof LineSpectrumConfigPanel>;
const onChange = vi.fn<Props["onChange"]>();
const lineSpectrumConfig = { ...rendererConfig.lineSpectrumConfig, stroke: true, fill: true };

async function renderPane(config = lineSpectrumConfig) {
  await customRender(<LineSpectrumConfigPanel config={config} onChange={onChange} />);
}

test("shows the placement, line and color fields", async () => {
  await renderPane();
  expect(screen.getByRole("combobox", { name: "Position" })).toBeInTheDocument();
  expect(screen.getByText(/^Smoothness:/)).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Stroke" })).toBeInTheDocument();
  expect(screen.getByRole("switch", { name: "Fill" })).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Gradient Direction" })).toBeInTheDocument();
});

test("stroke fields are hidden while stroke is off", async () => {
  await renderPane({ ...lineSpectrumConfig, stroke: false });
  expect(screen.queryByRole("textbox", { name: "Stroke Color" })).not.toBeInTheDocument();
  expect(screen.queryByText(/^Line Width/)).not.toBeInTheDocument();
});

test("fill opacity is hidden while fill is off", async () => {
  await renderPane({ ...lineSpectrumConfig, fill: false });
  expect(screen.queryByText(/^Fill Opacity/)).not.toBeInTheDocument();
});

test.each([
  [/^Bar Count/, "barCount"],
  [/^Smoothness/, "tension"],
  [/^Line Width/, "lineWidth"],
  [/^Stroke Opacity/, "strokeOpacity"],
  [/^Fill Opacity/, "fillOpacity"],
  [/^Opacity/, "opacity"],
])("%s slider updates %s", async (label, key) => {
  await renderPane();
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: expect.any(Number) }));
});

test.each([
  ["Stroke", "stroke"],
  ["Fill", "fill"],
])("%s switch updates %s", async (label, key) => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: label }));
  expect(onChange).toHaveBeenLastCalledWith({ [key]: false });
});

test("stroke color picker updates strokeColor", async () => {
  await renderPane();
  pickColor("Stroke Color", "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ strokeColor: "#123456" });
});
