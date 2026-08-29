import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, it, expect, vi } from "vitest";

import {
  GridResizableContext,
  type GridResizableContextValue,
} from "@/components/grid-resizable/grid-resizable-context";
import { GridResizablePanel } from "@/components/grid-resizable/grid-resizable-panel";
import { GridResizablePanelGroup } from "@/components/grid-resizable/grid-resizable-panel-group";
import { GridResizableSeparator } from "@/components/grid-resizable/grid-resizable-separator";
import type { PanelConfig } from "@/components/grid-resizable/types";

type SeparatorProps = ComponentProps<typeof GridResizableSeparator>;

const createMockContext = (): GridResizableContextValue => ({
  sizes: { panel1: 300 },
  panelConfigs: new Map([["panel1", { id: "panel1", defaultSize: 300 }]]),
  startResize: vi.fn<GridResizableContextValue["startResize"]>(),
  updateResize: vi.fn<GridResizableContextValue["updateResize"]>(),
  endResize: vi.fn<GridResizableContextValue["endResize"]>(),
  resizeByKeyboard: vi.fn<GridResizableContextValue["resizeByKeyboard"]>(),
  resizeToMin: vi.fn<GridResizableContextValue["resizeToMin"]>(),
  resizeToFit: vi.fn<GridResizableContextValue["resizeToFit"]>(),
  registerPanel: vi.fn<GridResizableContextValue["registerPanel"]>(),
  unregisterPanel: vi.fn<GridResizableContextValue["unregisterPanel"]>(),
  registerSeparator: vi.fn<GridResizableContextValue["registerSeparator"]>(),
  unregisterSeparator: vi.fn<GridResizableContextValue["unregisterSeparator"]>(),
});

function renderSeparator(props?: Partial<SeparatorProps>) {
  const context = createMockContext();
  render(
    <GridResizableContext.Provider value={context}>
      <GridResizableSeparator
        id="sep1"
        orientation="horizontal"
        panelId="panel1"
        side="before"
        {...props}
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
      const context = renderSeparator({ side: "after" });

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
      renderSeparator({ orientation: "vertical" });
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
      const getOptimalSizeForFit = vi.fn<NonNullable<SeparatorProps["getOptimalSizeForFit"]>>(
        () => 200,
      );
      const context = renderSeparator({ getOptimalSizeForFit });

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
