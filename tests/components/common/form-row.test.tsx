import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormRow } from "@/components/common/form-row";

describe("FormRow", () => {
  it("should render label and controller", () => {
    render(<FormRow label="Test Label" controller={<input type="text" />} />);

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should render with ReactNode as controller", () => {
    render(<FormRow label="Label" controller={<button>Click me</button>} />);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render with function as controller", () => {
    render(
      <FormRow
        label="Label"
        controller={({ id }) => <input type="text" aria-labelledby={id} />}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-labelledby");
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
        controller={<input type="checkbox" />}
      />,
    );

    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("should set aria-labelledby on controller wrapper when using function", () => {
    render(
      <FormRow
        label="Accessible Label"
        controller={({ id }) => <input type="text" id={`input-${id}`} />}
      />,
    );

    const labelDiv = screen.getByText("Accessible Label").closest("div");
    expect(labelDiv).toHaveAttribute("id");
  });
});
