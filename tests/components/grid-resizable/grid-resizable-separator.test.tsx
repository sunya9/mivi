import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GridResizableSeparator } from "@/components/grid-resizable/grid-resizable-separator";
import {
  GridResizableContext,
  type GridResizableContextValue,
} from "@/components/grid-resizable/grid-resizable-context";
import { GridResizablePanelGroup } from "@/components/grid-resizable/grid-resizable-panel-group";
import type { PanelConfig } from "@/components/grid-resizable/types";

const createMockContext = (
  overrides?: Partial<GridResizableContextValue>,
): GridResizableContextValue => ({
  sizes: { panel1: 1, panel2: 1 },
  panelConfigs: new Map([
    ["panel1", { id: "panel1", defaultSize: 1 }],
    ["panel2", { id: "panel2", defaultSize: 1 }],
  ]),
  startResize: vi.fn(),
  updateResize: vi.fn(),
  endResize: vi.fn(),
  resizeByKeyboard: vi.fn(),
  resizeToMin: vi.fn(),
  resizeToFit: vi.fn(),
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

    it("should have hidden md:block class for responsive visibility", () => {
      renderSeparator();
      const separator = screen.getByRole("separator");
      expect(separator).toHaveClass("hidden", "md:block");
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

    it("should call resizeToMin on Home key", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{Home}");

      expect(context.resizeToMin).toHaveBeenCalledWith(
        ["panel1", "panel2"],
        "panel1",
      );
    });

    it("should call resizeToMin on End key", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{End}");

      expect(context.resizeToMin).toHaveBeenCalledWith(
        ["panel1", "panel2"],
        "panel2",
      );
    });
  });

  describe("resizeToMin integration", () => {
    it("should actually resize panels when Home key is pressed", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000, constraints: { minSize: 100 } },
        { id: "panel2", defaultSize: 1000 },
      ];

      render(
        <GridResizablePanelGroup id="test-integration" panels={panels}>
          <div data-panel-id="panel1" />
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
          />
          <div data-panel-id="panel2" />
        </GridResizablePanelGroup>,
      );

      const separator = screen.getByRole("separator");
      expect(separator).toHaveAttribute("aria-valuenow", "50");

      separator.focus();
      await user.keyboard("{Home}");

      // Verify that aria-valuenow changed (panel1 shrunk to minimum)
      // panel1: 100, panel2: 1900, so valueNow should be ~5 (100 / 2000 * 100)
      const newValueNow = separator.getAttribute("aria-valuenow");
      expect(newValueNow).not.toBe("50");
      expect(Number(newValueNow)).toBeLessThan(10); // Should be around 5
    });

    it("should actually resize panels when End key is pressed", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000 },
        { id: "panel2", defaultSize: 1000, constraints: { minSize: 200 } },
      ];

      render(
        <GridResizablePanelGroup id="test-integration-end" panels={panels}>
          <div data-panel-id="panel1" />
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
          />
          <div data-panel-id="panel2" />
        </GridResizablePanelGroup>,
      );

      const separator = screen.getByRole("separator");
      expect(separator).toHaveAttribute("aria-valuenow", "50");

      separator.focus();
      await user.keyboard("{End}");

      // Verify that aria-valuenow changed (panel2 shrunk to minimum)
      // panel1: 1800, panel2: 200, so valueNow should be ~90 (1800 / 2000 * 100)
      const newValueNow = separator.getAttribute("aria-valuenow");
      expect(newValueNow).not.toBe("50");
      expect(Number(newValueNow)).toBeGreaterThan(85); // Should be around 90
    });
  });

  describe("resizeToFit integration", () => {
    it("should actually resize panels on double click with getOptimalSizeForFit", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000 },
        { id: "panel2", defaultSize: 1000 },
      ];

      // Mock function that returns 75% of total size
      const getOptimalSizeForFit = vi.fn(() => 150);

      const { container } = render(
        <GridResizablePanelGroup id="test-fit-integration" panels={panels}>
          <div
            data-panel-id="panel1"
            style={{ width: "100px", height: "100px" }}
          />
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
            getOptimalSizeForFit={getOptimalSizeForFit}
            fitTargetPanel="panel1"
          />
          <div
            data-panel-id="panel2"
            style={{ width: "100px", height: "100px" }}
          />
        </GridResizablePanelGroup>,
      );

      // Mock getBoundingClientRect for the panels
      const panel1 = container.querySelector('[data-panel-id="panel1"]');
      const panel2 = container.querySelector('[data-panel-id="panel2"]');

      if (panel1 && panel2) {
        panel1.getBoundingClientRect = vi.fn(() => ({
          width: 100,
          height: 100,
          top: 0,
          left: 0,
          bottom: 100,
          right: 100,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }));
        panel2.getBoundingClientRect = vi.fn(() => ({
          width: 100,
          height: 100,
          top: 0,
          left: 100,
          bottom: 100,
          right: 200,
          x: 100,
          y: 0,
          toJSON: () => ({}),
        }));
      }

      const separator = screen.getByRole("separator");
      expect(separator).toHaveAttribute("aria-valuenow", "50");

      await user.dblClick(separator);

      // Verify that getOptimalSizeForFit was called
      expect(getOptimalSizeForFit).toHaveBeenCalled();

      // Since we're mocking getBoundingClientRect to return width: 100 for each panel,
      // totalPixels = 200, optimalPixelSize = 150
      // ratio = 150/200 = 0.75
      // panel1 should be 75% of total fr (1.5), panel2 should be 25% (0.5)
      const newValueNow = separator.getAttribute("aria-valuenow");
      expect(newValueNow).not.toBe("50");
      expect(Number(newValueNow)).toBeGreaterThan(70); // Should be around 75
    });

    it("should resize vertical orientation panels on double click", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000 },
        { id: "panel2", defaultSize: 1000 },
      ];

      // Mock function that returns 25% of total height
      const getOptimalSizeForFit = vi.fn(() => 50);

      const { container } = render(
        <GridResizablePanelGroup id="test-fit-vertical" panels={panels}>
          <div
            data-panel-id="panel1"
            style={{ width: "100px", height: "100px" }}
          />
          <GridResizableSeparator
            id="sep1"
            orientation="vertical"
            controls={["panel1", "panel2"]}
            getOptimalSizeForFit={getOptimalSizeForFit}
            fitTargetPanel="panel1"
          />
          <div
            data-panel-id="panel2"
            style={{ width: "100px", height: "100px" }}
          />
        </GridResizablePanelGroup>,
      );

      // Mock getBoundingClientRect for the panels (vertical uses height)
      const panel1 = container.querySelector('[data-panel-id="panel1"]');
      const panel2 = container.querySelector('[data-panel-id="panel2"]');

      if (panel1 && panel2) {
        panel1.getBoundingClientRect = vi.fn(() => ({
          width: 100,
          height: 100,
          top: 0,
          left: 0,
          bottom: 100,
          right: 100,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }));
        panel2.getBoundingClientRect = vi.fn(() => ({
          width: 100,
          height: 100,
          top: 100,
          left: 0,
          bottom: 200,
          right: 100,
          x: 0,
          y: 100,
          toJSON: () => ({}),
        }));
      }

      const separator = screen.getByRole("separator");
      expect(separator).toHaveAttribute("aria-valuenow", "50");

      await user.dblClick(separator);

      // Verify that getOptimalSizeForFit was called
      expect(getOptimalSizeForFit).toHaveBeenCalled();

      // Since we're mocking getBoundingClientRect to return height: 100 for each panel,
      // totalPixels = 200, optimalPixelSize = 50
      // ratio = 50/200 = 0.25
      // panel1 should be 25% of total fr (0.5), panel2 should be 75% (1.5)
      const newValueNow = separator.getAttribute("aria-valuenow");
      expect(newValueNow).not.toBe("50");
      expect(Number(newValueNow)).toBeLessThan(30); // Should be around 25
    });

    it("should not resize if getOptimalSizeForFit returns null", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000 },
        { id: "panel2", defaultSize: 1000 },
      ];

      const getOptimalSizeForFit = vi.fn(() => null);

      render(
        <GridResizablePanelGroup id="test-fit-null" panels={panels}>
          <div data-panel-id="panel1" />
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
            getOptimalSizeForFit={getOptimalSizeForFit}
            fitTargetPanel="panel1"
          />
          <div data-panel-id="panel2" />
        </GridResizablePanelGroup>,
      );

      const separator = screen.getByRole("separator");
      expect(separator).toHaveAttribute("aria-valuenow", "50");

      await user.dblClick(separator);

      // Sizes should remain unchanged
      expect(separator).toHaveAttribute("aria-valuenow", "50");
    });

    it("should resize px panel on double click with getOptimalSizeForFit", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        {
          id: "panel1",
          defaultSize: 300,
          sizeUnit: "px",
          constraints: { minSize: 100 },
        },
        { id: "panel2", defaultSize: 1000 },
      ];

      // Mock function that returns 200px
      const getOptimalSizeForFit = vi.fn(() => 200);

      render(
        <GridResizablePanelGroup id="test-fit-px" panels={panels}>
          <div
            data-panel-id="panel1"
            style={{ width: "300px", height: "100px" }}
          />
          <GridResizableSeparator
            id="sep1"
            orientation="vertical"
            controls={["panel1", "panel2"]}
            getOptimalSizeForFit={getOptimalSizeForFit}
            fitTargetPanel="panel1"
          />
          <div
            data-panel-id="panel2"
            style={{ width: "100px", height: "100px" }}
          />
        </GridResizablePanelGroup>,
      );

      const separator = screen.getByRole("separator");
      // Initial valueNow: panel1=300, panel2=1, but for px+fr the valueNow doesn't use ratio
      // Since panel1 is px, we can't calculate percentage directly - just verify it changes

      await user.dblClick(separator);

      // Verify that getOptimalSizeForFit was called
      expect(getOptimalSizeForFit).toHaveBeenCalled();
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

  describe("pointer interaction", () => {
    it("should call endResize on pointercancel", () => {
      const context = renderSeparator();
      const separator = screen.getByRole("separator");

      const releasePointerCapture = vi.fn();
      separator.releasePointerCapture = releasePointerCapture;

      fireEvent.pointerCancel(separator, { pointerId: 1 });

      expect(releasePointerCapture).toHaveBeenCalledWith(1);
      expect(context.endResize).toHaveBeenCalled();
    });
  });

  describe("double click interaction", () => {
    it("should call resizeToFit on double click when getOptimalSizeForFit is provided", async () => {
      const user = userEvent.setup();
      const context = createMockContext();
      const getOptimalSizeForFit = vi.fn(() => 200);

      render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            controls={["panel1", "panel2"]}
            getOptimalSizeForFit={getOptimalSizeForFit}
            fitTargetPanel="panel1"
          />
        </GridResizableContext.Provider>,
      );

      const separator = screen.getByRole("separator");
      await user.dblClick(separator);

      expect(context.resizeToFit).toHaveBeenCalledWith(
        "sep1",
        "horizontal",
        ["panel1", "panel2"],
        "panel1",
        getOptimalSizeForFit,
      );
    });

    it("should use beforeId as default fitTargetPanel", async () => {
      const user = userEvent.setup();
      const context = createMockContext();
      const getOptimalSizeForFit = vi.fn(() => 200);

      render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator
            id="sep1"
            orientation="vertical"
            controls={["panel1", "panel2"]}
            getOptimalSizeForFit={getOptimalSizeForFit}
          />
        </GridResizableContext.Provider>,
      );

      const separator = screen.getByRole("separator");
      await user.dblClick(separator);

      expect(context.resizeToFit).toHaveBeenCalledWith(
        "sep1",
        "vertical",
        ["panel1", "panel2"],
        "panel1",
        getOptimalSizeForFit,
      );
    });

    it("should not call resizeToFit on double click when getOptimalSizeForFit is not provided", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      await user.dblClick(separator);

      expect(context.resizeToFit).not.toHaveBeenCalled();
    });
  });
});
