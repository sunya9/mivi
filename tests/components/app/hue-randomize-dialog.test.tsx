import { expect, test, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HueRandomizeDialog } from "@/components/app/hue-randomize-dialog";
import { customRender } from "tests/util";

test("renders dialog when open is true", () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByText("Randomize Hue")).toBeInTheDocument();
});

test("does not render dialog when open is false", () => {
  customRender(
    <HueRandomizeDialog
      open={false}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("displays default saturation and lightness values when no localStorage value", () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.getByText("100%")).toBeInTheDocument();
  expect(screen.getByText("50%")).toBeInTheDocument();
});

test("displays localStorage values when available", () => {
  localStorage.setItem(
    "mivi:hue-randomize-sl",
    JSON.stringify({ s: 80, l: 70 }),
  );
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.getByText("80%")).toBeInTheDocument();
  expect(screen.getByText("70%")).toBeInTheDocument();
});

test("renders 8 preview color swatches", () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  const dialog = screen.getByRole("dialog");
  const swatches = within(dialog)
    .getAllByRole("generic")
    .filter((el) => el.style.backgroundColor !== "");
  expect(swatches.length).toBe(8);
});

test("renders all preset buttons", () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.getByRole("button", { name: /vivid/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /pastel/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /dark/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /muted/i })).toBeInTheDocument();
});

test("clicking vivid preset updates values to s=100, l=60", async () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /vivid/i }));

  expect(screen.getByText("100%")).toBeInTheDocument();
  expect(screen.getByText("60%")).toBeInTheDocument();
});

test("clicking pastel preset updates values to s=80, l=80", async () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /pastel/i }));

  // Both saturation and lightness are 80%, so there should be two elements
  const percentages = screen.getAllByText("80%");
  expect(percentages.length).toBe(2);
});

test("clicking dark preset updates values to s=80, l=30", async () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /dark/i }));

  expect(screen.getByText("80%")).toBeInTheDocument();
  expect(screen.getByText("30%")).toBeInTheDocument();
});

test("clicking muted preset updates values to s=40, l=60", async () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /muted/i }));

  expect(screen.getByText("40%")).toBeInTheDocument();
  expect(screen.getByText("60%")).toBeInTheDocument();
});

test("Apply button calls onConfirm with current values and saves to localStorage", async () => {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();

  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />,
  );

  // Click vivid preset to get known values (s=100, l=60)
  await userEvent.click(screen.getByRole("button", { name: /vivid/i }));
  await userEvent.click(screen.getByRole("button", { name: /apply/i }));

  expect(onConfirm).toHaveBeenCalledWith(100, 60);
  expect(localStorage.getItem("mivi:hue-randomize-sl")).toBe(
    JSON.stringify({ s: 100, l: 60 }),
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("Cancel button closes dialog without calling onConfirm or saving", async () => {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();

  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

  expect(onConfirm).not.toHaveBeenCalled();
  expect(localStorage.getItem("mivi:hue-randomize-sl")).not.toBe(
    JSON.stringify({ s: 100, l: 60 }),
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test("renders saturation and lightness sliders with correct labels", () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  expect(screen.getByText("Saturation")).toBeInTheDocument();
  expect(screen.getByText("Lightness")).toBeInTheDocument();
  expect(screen.getAllByRole("slider").length).toBe(2);
});

test("clicking label focuses the corresponding slider", async () => {
  customRender(
    <HueRandomizeDialog
      open={true}
      onOpenChange={vi.fn()}
      onConfirm={vi.fn()}
    />,
  );

  const saturationLabel = screen.getByText("Saturation");
  const saturationSlider = screen.getByRole("slider", { name: "Saturation" });

  await userEvent.click(saturationLabel);
  expect(saturationSlider).toHaveFocus();

  const lightnessLabel = screen.getByText("Lightness");
  const lightnessSlider = screen.getByRole("slider", { name: "Lightness" });

  await userEvent.click(lightnessLabel);
  expect(lightnessSlider).toHaveFocus();
});
