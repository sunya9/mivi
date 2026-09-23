import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { rendererConfig } from "tests/fixtures";
import { chooseAnotherOption, customRender, nudgeSlider, pickColor } from "tests/util";
import { expect, test, vi } from "vitest";

import { BarsConfigPanel } from "@/components/app/bars-config-panel";

type Props = ComponentProps<typeof BarsConfigPanel>;
const onChange = vi.fn<Props["onChange"]>();
const barsConfig = { ...rendererConfig.barsConfig, mirror: true, useGradient: true };

async function renderPane(config = barsConfig) {
  await customRender(<BarsConfigPanel config={config} onChange={onChange} />);
}

test("position options are Top, Center, Bottom and update position", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("combobox", { name: "Position" }));
  const options = screen.getAllByRole("option");
  expect(options.map((option) => option.textContent)).toEqual(["Top", "Center", "Bottom"]);

  await userEvent.click(options[0]);
  expect(onChange).toHaveBeenCalledWith({ position: "top" });
});

test("mirror switch updates mirror", async () => {
  await renderPane({ ...barsConfig, mirror: false });
  await userEvent.click(screen.getByRole("switch", { name: "Mirror" }));
  expect(onChange).toHaveBeenCalledWith({ mirror: true });
});

test("gradient direction is shown only while gradients are on", async () => {
  await renderPane();
  expect(screen.getByRole("combobox", { name: "Gradient Direction" })).toBeInTheDocument();
});

test("single color picker replaces the gradient fields when gradients are off", async () => {
  await renderPane({ ...barsConfig, useGradient: false });
  expect(screen.queryByRole("combobox", { name: "Gradient Direction" })).not.toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Color" })).toBeInTheDocument();
});

test.each([
  [/^Height/, "height"],
  [/^Mirror Opacity/, "mirrorOpacity"],
  [/^Bar Count/, "barCount"],
  [/^Gap/, "barGap"],
  [/^Padding/, "barPadding"],
  [/^Min Height/, "barMinHeight"],
  [/^Opacity/, "opacity"],
  [/^Attack/, "attackTime"],
  [/^Release/, "releaseTime"],
])("%s slider updates %s", async (label, key) => {
  await renderPane();
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: expect.any(Number) }));
});

test("frequency range slider updates both bounds", async () => {
  await renderPane();
  await nudgeSlider(/^Frequency Range/);
  expect(onChange).toHaveBeenLastCalledWith({
    minFrequency: expect.any(Number),
    maxFrequency: expect.any(Number),
  });
});

test.each([
  ["Bar Style", "barStyle"],
  ["Gradient Direction", "gradientDirection"],
])("%s select updates %s", async (label, key) => {
  await renderPane();
  await chooseAnotherOption(label);
  expect(onChange).toHaveBeenLastCalledWith({ [key]: expect.any(String) });
});

test("use gradient switch updates useGradient", async () => {
  await renderPane();
  await userEvent.click(screen.getByRole("switch", { name: "Use Gradient" }));
  expect(onChange).toHaveBeenLastCalledWith({ useGradient: false });
});

test.each([
  ["Gradient Start Color", "gradientStartColor"],
  ["Gradient End Color", "gradientEndColor"],
])("%s picker updates %s", async (label, key) => {
  await renderPane();
  pickColor(label, "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ [key]: "#123456" });
});

test("single color picker updates singleColor", async () => {
  await renderPane({ ...barsConfig, useGradient: false });
  pickColor("Color", "#123456");
  expect(onChange).toHaveBeenLastCalledWith({ singleColor: "#123456" });
});
