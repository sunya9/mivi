import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GridResizableSeparator } from "@/components/grid-resizable/grid-resizable-separator";
import { GridResizableContext } from "@/components/grid-resizable/grid-resizable-context";
import type { GridResizableContextValue } from "@/components/grid-resizable/types";

const createMockContext = (
  overrides?: Partial<GridResizableContextValue>,
): GridResizableContextValue => ({
  sizes: { panel1: 1, panel2: 1 },
  panelConfigs: new Map([
    ["panel1", { id: "panel1", defaultSize: 1 }],
    ["panel2", { id: "panel2", defaultSize: 1 }],
  ]),
  isMobile: false,
  startResize: vi.fn(),
  updateResize: vi.fn(),
  endResize: vi.fn(),
  resizeByKeyboard: vi.fn(),
  getContainerRef: vi.fn(() => null),
  ...overrides,
});

function renderSeparator(
  contextOverrides?: Partial<GridResizableContextValue>,
) {
  const context = createMockContext(contextOverrides);
  render(
    <GridResizableContext.Provider value={context}>
      <GridResizableSeparator
        id="sep1"
        orientation="horizontal"
        controls={["panel1", "panel2"]}
      />
    </GridResizableContext.Provider>,
  );
  return context;
}

describe("GridResizableSeparator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render separator with correct role", () => {
      renderSeparator();
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("should render with correct aria attributes", () => {
      renderSeparator();
      const separator = screen.getByRole("separator");

      expect(separator).toHaveAttribute("aria-orientation", "vertical");
      expect(separator).toHaveAttribute("aria-controls", "panel1 panel2");
      expect(separator).toHaveAttribute("aria-valuenow", "50");
      expect(separator).toHaveAttribute("aria-valuemin", "0");
      expect(separator).toHaveAttribute("aria-valuemax", "100");
    });

    it("should render with correct data attributes", () => {
      renderSeparator();
      const separator = screen.getByRole("separator");

      expect(separator).toHaveAttribute(
        "data-slot",
        "grid-resizable-separator",
      );
      expect(separator).toHaveAttribute("data-separator-id", "sep1");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should have tabIndex 0 for keyboard accessibility", () => {
      renderSeparator();
      expect(screen.getByRole("separator")).toHaveAttribute("tabIndex", "0");
    });

    it("should return null when isMobile is true", () => {
      const { container } = render(
        <GridResizableContext.Provider
          value={createMockContext({ isMobile: true })}
        >
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
          />
        </GridResizableContext.Provider>,
      );

      expect(container.querySelector('[role="separator"]')).toBeNull();
    });
  });

  describe("keyboard interaction", () => {
    it("should call resizeByKeyboard on ArrowRight", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowRight}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith(
        "horizontal",
        ["panel1", "panel2"],
        1,
        undefined,
      );
    });

    it("should call resizeByKeyboard on ArrowLeft", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowLeft}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith(
        "horizontal",
        ["panel1", "panel2"],
        -1,
        undefined,
      );
    });

    it("should call resizeByKeyboard on ArrowUp", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowUp}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith(
        "horizontal",
        ["panel1", "panel2"],
        -1,
        undefined,
      );
    });

    it("should call resizeByKeyboard on ArrowDown", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowDown}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith(
        "horizontal",
        ["panel1", "panel2"],
        1,
        undefined,
      );
    });

    it("should not respond to keyboard when isMobile", () => {
      const context = createMockContext({ isMobile: true });

      const { container } = render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
          />
        </GridResizableContext.Provider>,
      );

      // Separator doesn't render on mobile
      expect(container.querySelector('[role="separator"]')).toBeNull();
    });
  });

  describe("valueNow calculation", () => {
    it("should calculate valueNow correctly with equal sizes", () => {
      renderSeparator({ sizes: { panel1: 1, panel2: 1 } });
      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-valuenow",
        "50",
      );
    });

    it("should calculate valueNow correctly with different sizes", () => {
      renderSeparator({ sizes: { panel1: 3, panel2: 1 } });
      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-valuenow",
        "75",
      );
    });

    it("should calculate valueNow correctly when before panel is smaller", () => {
      renderSeparator({ sizes: { panel1: 1, panel2: 3 } });
      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-valuenow",
        "25",
      );
    });
  });

  describe("orientation", () => {
    it("should have correct aria-orientation for horizontal separator", () => {
      renderSeparator();
      // horizontal separator controls vertical split
      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-orientation",
        "vertical",
      );
    });

    it("should have correct aria-orientation for vertical separator", () => {
      const context = createMockContext();
      render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator
            id="sep1"
            orientation="vertical"
            controls={["panel1", "panel2"]}
          />
        </GridResizableContext.Provider>,
      );
      // vertical separator controls horizontal split
      expect(screen.getByRole("separator")).toHaveAttribute(
        "aria-orientation",
        "horizontal",
      );
    });
  });
});
