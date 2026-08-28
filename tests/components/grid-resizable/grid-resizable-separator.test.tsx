import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GridResizableSeparator } from "@/components/grid-resizable/grid-resizable-separator";
import {
  GridResizableContext,
  type GridResizableContextValue,
} from "@/components/grid-resizable/grid-resizable-context";
import { GridResizablePanelGroup } from "@/components/grid-resizable/grid-resizable-panel-group";
import { GridResizablePanel } from "@/components/grid-resizable/grid-resizable-panel";
import type {
  Orientation,
  PanelConfig,
  PanelSize,
  SeparatorSide,
} from "@/components/grid-resizable/types";

const createMockContext = (
  overrides?: Partial<GridResizableContextValue>,
): GridResizableContextValue => ({
  sizes: { panel1: 300 },
  panelConfigs: new Map([["panel1", { id: "panel1", defaultSize: 300 }]]),
  startResize: vi.fn<(panelId: string, side: SeparatorSide, orientation: Orientation) => void>(),
  updateResize: vi.fn<(currentPosition: number) => void>(),
  endResize: vi.fn<() => void>(),
  resizeByKeyboard: vi.fn<(panelId: string, delta: number, orientation: Orientation) => void>(),
  resizeToMin: vi.fn<(panelId: string) => void>(),
  resizeToFit:
    vi.fn<
      (
        panelId: string,
        getOptimalSize: (sizes: Record<string, PanelSize>) => number | undefined,
      ) => void
    >(),
  registerPanel: vi.fn<(id: string, element: HTMLElement) => void>(),
  unregisterPanel: vi.fn<(id: string) => void>(),
  registerSeparator: vi.fn<(id: string, element: HTMLElement, orientation: Orientation) => void>(),
  unregisterSeparator: vi.fn<(id: string) => void>(),
  ...overrides,
});

function renderSeparator(contextOverrides?: Partial<GridResizableContextValue>) {
  const context = createMockContext(contextOverrides);
  render(
    <GridResizableContext.Provider value={context}>
      <GridResizableSeparator id="sep1" orientation="horizontal" panelId="panel1" side="before" />
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
      expect(separator).toHaveAttribute("aria-controls", "panel1");
      expect(separator).toHaveAttribute("aria-valuenow", "300");
      expect(separator).toHaveAttribute("aria-label", "Resize panel1 panel");
    });

    it("should render with correct data attributes", () => {
      renderSeparator();
      const separator = screen.getByRole("separator");

      expect(separator).toHaveAttribute("data-slot", "grid-resizable-separator");
      expect(separator).toHaveAttribute("data-separator-id", "sep1");
      expect(separator).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should have tabIndex 0 for keyboard accessibility", () => {
      renderSeparator();
      expect(screen.getByRole("separator")).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("keyboard interaction (before panel)", () => {
    it("should increase on ArrowRight for before panel", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowRight}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith("panel1", 20, "horizontal");
    });

    it("should decrease on ArrowLeft for before panel", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowLeft}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith("panel1", -20, "horizontal");
    });

    it("should use large step with Shift", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{Shift>}{ArrowRight}{/Shift}");

      expect(context.resizeByKeyboard).toHaveBeenCalledWith("panel1", 50, "horizontal");
    });

    it("should call resizeToMin on Home key", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{Home}");

      expect(context.resizeToMin).toHaveBeenCalledWith("panel1");
    });
  });

  describe("keyboard interaction (after panel)", () => {
    it("should reverse direction for after panel", async () => {
      const user = userEvent.setup();
      const context = createMockContext();
      render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            panelId="panel1"
            side="after"
          />
        </GridResizableContext.Provider>,
      );

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowRight}");

      // ArrowRight on "after" panel → decrease (reversed)
      expect(context.resizeByKeyboard).toHaveBeenCalledWith("panel1", -20, "horizontal");
    });
  });

  describe("orientation", () => {
    it("should have correct aria-orientation for horizontal separator", () => {
      renderSeparator();
      expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
    });

    it("should have correct aria-orientation for vertical separator", () => {
      const context = createMockContext();
      render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator id="sep1" orientation="vertical" panelId="panel1" side="before" />
        </GridResizableContext.Provider>,
      );
      expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
    });
  });

  describe("pointer interaction", () => {
    it("should call endResize on lostpointercapture", () => {
      const context = renderSeparator();
      const separator = screen.getByRole("separator");

      fireEvent.lostPointerCapture(separator);

      expect(context.endResize).toHaveBeenCalled();
    });

    it("should release pointer capture on pointerup", () => {
      renderSeparator();
      const separator = screen.getByRole("separator");

      const releasePointerCapture = vi.fn<(pointerId: number) => void>();
      separator.releasePointerCapture = releasePointerCapture;

      fireEvent.pointerUp(separator, { pointerId: 1 });

      expect(releasePointerCapture).toHaveBeenCalledWith(1);
    });
  });

  describe("double click interaction", () => {
    it("should call resizeToFit on double click when getOptimalSizeForFit is provided", async () => {
      const user = userEvent.setup();
      const context = createMockContext();
      const getOptimalSizeForFit = vi.fn<(sizes: Record<string, PanelSize>) => number | undefined>(
        () => 200,
      );

      render(
        <GridResizableContext.Provider value={context}>
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            panelId="panel1"
            side="before"
            getOptimalSizeForFit={getOptimalSizeForFit}
          />
        </GridResizableContext.Provider>,
      );

      const separator = screen.getByRole("separator");
      await user.dblClick(separator);

      expect(context.resizeToFit).toHaveBeenCalledWith("panel1", getOptimalSizeForFit);
    });

    it("should not call resizeToFit when getOptimalSizeForFit is not provided", async () => {
      const user = userEvent.setup();
      const context = renderSeparator();

      const separator = screen.getByRole("separator");
      await user.dblClick(separator);

      expect(context.resizeToFit).not.toHaveBeenCalled();
    });
  });

  describe("integration with PanelGroup", () => {
    it("should resize panel on Home key", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 300, constraints: { minSize: 100 } },
      ];

      render(
        <GridResizablePanelGroup id="test-integration" panels={panels}>
          <GridResizablePanel panelId="panel1" />
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            panelId="panel1"
            side="before"
          />
        </GridResizablePanelGroup>,
      );

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{Home}");

      // Panel should be minimized to 100px
      expect(separator).toHaveAttribute("aria-valuenow", "100");
    });

    it("should resize panel with keyboard", async () => {
      const user = userEvent.setup();
      const panels: PanelConfig[] = [{ id: "panel1", defaultSize: 300 }];

      render(
        <GridResizablePanelGroup id="test-keyboard" panels={panels}>
          <GridResizablePanel panelId="panel1" />
          <GridResizableSeparator
            id="sep1"
            orientation="horizontal"
            panelId="panel1"
            side="before"
          />
        </GridResizablePanelGroup>,
      );

      const separator = screen.getByRole("separator");
      separator.focus();
      await user.keyboard("{ArrowRight}");

      expect(separator).toHaveAttribute("aria-valuenow", "320");
    });
  });
});
