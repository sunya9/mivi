import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomNav } from "@/components/app/mobile-bottom-nav";

describe("MobileBottomNav", () => {
  it("should render all three tabs", () => {
    render(<MobileBottomNav value="tracks" onValueChange={vi.fn()} />);

    expect(screen.getByText("Tracks")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Style")).toBeInTheDocument();
  });

  it("should highlight the active tab", () => {
    render(<MobileBottomNav value="visualizer" onValueChange={vi.fn()} />);

    const settingsTab = screen.getByRole("tab", { name: /settings/i });
    expect(settingsTab).toHaveAttribute("data-state", "active");
  });

  it("should call onValueChange when tab is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<MobileBottomNav value="tracks" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: /style/i }));

    expect(onValueChange).toHaveBeenCalledWith("style");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <MobileBottomNav
        value="tracks"
        onValueChange={vi.fn()}
        className="custom-class"
      />,
    );

    const nav = container.firstChild;
    expect(nav).toHaveClass("custom-class");
  });

  it("should show tracks tab as active by default when value is tracks", () => {
    render(<MobileBottomNav value="tracks" onValueChange={vi.fn()} />);

    const tracksTab = screen.getByRole("tab", { name: /tracks/i });
    expect(tracksTab).toHaveAttribute("data-state", "active");
  });

  it("should call onValueChange with correct value for each tab", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<MobileBottomNav value="tracks" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: /settings/i }));
    expect(onValueChange).toHaveBeenLastCalledWith("visualizer");

    await user.click(screen.getByRole("tab", { name: /style/i }));
    expect(onValueChange).toHaveBeenLastCalledWith("style");
  });

  it("should render icons for each tab", () => {
    render(<MobileBottomNav value="tracks" onValueChange={vi.fn()} />);

    const svgIcons = document.querySelectorAll("svg");
    expect(svgIcons).toHaveLength(3);
  });
});
