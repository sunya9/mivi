import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { rendererConfig } from "tests/fixtures";
import { chooseAnotherOption, customRender, nudgeSlider } from "tests/util";
import { expect, test, vi } from "vitest";

import { CircularConfigPanel } from "@/components/app/circular-config-panel";

type Props = ComponentProps<typeof CircularConfigPanel>;
const onChange = vi.fn<Props["onChange"]>();
const circularConfig = { ...rendererConfig.circularConfig, mirror: true };

async function renderPane(config = circularConfig) {
  await customRender(<CircularConfigPanel config={config} onChange={onChange} />);
}

test("has a size slider and no position or gradient direction", async () => {
  await renderPane();
  expect(screen.getByText(/^Size:/)).toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "Position" })).not.toBeInTheDocument();
  expect(screen.queryByRole("combobox", { name: "Gradient Direction" })).not.toBeInTheDocument();
});

test("mirror switch updates mirror", async () => {
  await renderPane({ ...circularConfig, mirror: false });
  await userEvent.click(screen.getByRole("switch", { name: "Mirror" }));
  expect(onChange).toHaveBeenCalledWith({ mirror: true });
});

test.each([
  [/^Size/, "size"],
  [/^Mirror Opacity/, "mirrorOpacity"],
  [/^Bar Count/, "barCount"],
  [/^Min Height/, "barMinHeight"],
  [/^Opacity/, "opacity"],
  [/^Attack/, "attackTime"],
])("%s slider updates %s", async (label, key) => {
  await renderPane();
  await nudgeSlider(label);
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: expect.any(Number) }));
});

test("bar style select updates barStyle", async () => {
  await renderPane();
  await chooseAnotherOption("Bar Style");
  expect(onChange).toHaveBeenLastCalledWith({ barStyle: expect.any(String) });
});
