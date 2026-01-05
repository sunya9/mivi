import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { InfoTooltip } from "@/components/common/info-tooltip";

describe("InfoTooltip", () => {
  it("should render info icon", () => {
    render(<InfoTooltip>Tooltip content</InfoTooltip>);

    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("size-4");
  });

  it("should render tooltip trigger with correct data-slot", () => {
    render(<InfoTooltip>Helpful information</InfoTooltip>);

    const trigger = document.querySelector('[data-slot="tooltip-trigger"]');
    expect(trigger).toBeInTheDocument();
  });

  it("should render lucide info icon", () => {
    render(<InfoTooltip>Content</InfoTooltip>);

    const icon = document.querySelector("svg.lucide-info");
    expect(icon).toBeInTheDocument();
  });
});
