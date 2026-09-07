import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { FormRow } from "@/components/common/form-row";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";

function renderField(onValueChange = vi.fn<(value: number | null) => void>()) {
  render(
    <FormRow
      label="Offset"
      controller={({ id }) => (
        <NumberField id={id} defaultValue={0} step={0.1} onValueChange={onValueChange}>
          <NumberFieldGroup>
            <NumberFieldDecrement aria-label="Decrease" />
            <NumberFieldInput />
            <NumberFieldIncrement aria-label="Increase" />
          </NumberFieldGroup>
        </NumberField>
      )}
    />,
  );
  return onValueChange;
}

test("is labelled by the form row label", () => {
  renderField();

  expect(screen.getByRole("textbox", { name: "Offset" })).toHaveValue("0");
});

test("steps the value with the increment and decrement buttons", async () => {
  const onValueChange = renderField();

  await userEvent.click(screen.getByRole("button", { name: "Increase" }));
  expect(onValueChange).toHaveBeenLastCalledWith(0.1, expect.anything());

  await userEvent.click(screen.getByRole("button", { name: "Decrease" }));
  expect(onValueChange).toHaveBeenLastCalledWith(0, expect.anything());
});
