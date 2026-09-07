import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import { FormRow } from "@/components/common/form-row";
import { Switch } from "@/components/ui/switch";

describe("FormRow", () => {
  it("should render label and controller", () => {
    render(<FormRow label="Test Label" controller={({ id }) => <input type="text" id={id} />} />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should render with ReactNode as controller", () => {
    render(<FormRow label="Label" controller={({ id }) => <button id={id}>Click me</button>} />);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should pass id to controller function", () => {
    let receivedId: string | undefined;

    render(
      <FormRow
        label="Label"
        controller={({ id }) => {
          receivedId = id;
          return <span>Controller</span>;
        }}
      />,
    );

    expect(receivedId).toBeDefined();
    expect(typeof receivedId).toBe("string");
    expect(receivedId!.length).toBeGreaterThan(0);
  });

  it("should render complex label content", () => {
    render(
      <FormRow
        label={
          <span>
            Complex <strong>Label</strong>
          </span>
        }
        controller={({ id }) => <input type="checkbox" id={id} />}
      />,
    );

    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("should associate a switch with the label natively", async () => {
    render(<FormRow label="Toggle" controller={({ id }) => <Switch id={id} />} />);

    const toggle = screen.getByRole("switch", { name: "Toggle" });
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await userEvent.click(screen.getByText("Toggle"));
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
