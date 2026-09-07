import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { SelectRow } from "@/components/common/select-row";
import { SelectContent, SelectItem } from "@/components/ui/select";

const items = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

function renderRow(props: Partial<React.ComponentProps<typeof SelectRow<string, false>>> = {}) {
  return render(
    <SelectRow label={<span>Format</span>} items={items} value="a" {...props}>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRow>,
  );
}

test("names the trigger after the label", () => {
  renderRow();

  expect(screen.getByRole("combobox", { name: "Format" })).toHaveTextContent("A");
});

test("clicking the label focuses the trigger without opening the list", async () => {
  renderRow();

  await userEvent.click(screen.getByText("Format"));

  const trigger = screen.getByRole("combobox", { name: "Format" });
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("gives every trigger the same width unless overridden", () => {
  const { unmount } = renderRow();
  expect(screen.getByRole("combobox")).toHaveClass("w-48");
  unmount();

  renderRow({ triggerClassName: "w-32" });
  const trigger = screen.getByRole("combobox");
  expect(trigger).toHaveClass("w-32");
  expect(trigger).not.toHaveClass("w-48");
});

test("shows the placeholder while nothing is selected", () => {
  renderRow({ value: null, placeholder: "Select format" });

  expect(screen.getByRole("combobox")).toHaveTextContent("Select format");
});
