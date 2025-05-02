import { VisualizerStyle } from "@/components/app/visualizer-style";
import { ComponentProps } from "react";
import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rendererConfig } from "tests/fixtures";

type Props = ComponentProps<typeof VisualizerStyle>;
const onUpdateRendererConfig: Props["onUpdateRendererConfig"] = vi.fn();
const props: Props = {
  rendererConfig,
  onUpdateRendererConfig,
};

test("should render", async () => {
  render(<VisualizerStyle {...props} />);
  expect(screen.getByText("Visualizer Style")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("combobox", { name: "Style" }));
  await userEvent.click(screen.getByLabelText("Piano Roll"));
  // becaues same value
  expect(onUpdateRendererConfig).not.toHaveBeenCalledWith({
    type: "pianoRoll",
  });
});
