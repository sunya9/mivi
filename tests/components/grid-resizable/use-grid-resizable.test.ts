import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useGridResizable,
  DEFAULT_KEYBOARD_STEP,
  LARGE_KEYBOARD_STEP,
} from "@/components/grid-resizable/use-grid-resizable";
import type { PanelConfig } from "@/components/grid-resizable/types";

const STORAGE_KEY_PREFIX = "grid-resizable:v2:";

describe("useGridResizable", () => {
  // Use large integers for fr values to avoid floating point errors
  const defaultPanels: PanelConfig[] = [
    { id: "panel1", defaultSize: 1000 },
    { id: "panel2", defaultSize: 1000 },
  ];

  const pxFrPanels: PanelConfig[] = [
    {
      id: "panel1",
      defaultSize: 300,
      sizeUnit: "px",
      constraints: { minSize: 100 },
    },
    { id: "panel2", defaultSize: 1000 },
  ];

  describe("initialization", () => {
    it("should initialize with default sizes from panels", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 1000,
        panel2: 1000,
      });
    });

    it("should load sizes from localStorage if available", () => {
      const storedState = { sizes: { panel1: 500, panel2: 1500 } };
      localStorage.setItem(
        STORAGE_KEY_PREFIX + "test",
        JSON.stringify(storedState),
      );

      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 500,
        panel2: 1500,
      });
    });

    it("should return panelConfigs as a Map", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.contextValue.panelConfigs).toBeInstanceOf(Map);
      expect(result.current.contextValue.panelConfigs.get("panel1")).toEqual(
        defaultPanels[0],
      );
      expect(result.current.contextValue.panelConfigs.get("panel2")).toEqual(
        defaultPanels[1],
      );
    });

    it("should provide containerRef", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.containerRef).toBeDefined();
    });

    it("should generate panelStyles with CSS variables", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.panelStyles).toEqual({
        "--panel-panel1": "1000fr",
        "--panel-panel2": "1000fr",
      });
    });

    it("should generate panelStyles with px unit for px panels", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px", panels: pxFrPanels }),
      );

      expect(result.current.panelStyles).toEqual({
        "--panel-panel1": "300px",
        "--panel-panel2": "1000fr",
      });
    });

    it("should initialize px panels with correct default size", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-init", panels: pxFrPanels }),
      );

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 300,
        panel2: 1000,
      });
    });
  });

  describe("resizeByKeyboard", () => {
    it("should resize panels by default step", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          1,
        );
      });

      // DEFAULT_KEYBOARD_STEP is 50 for fr panels
      expect(result.current.contextValue.sizes.panel1).toBe(
        1000 + DEFAULT_KEYBOARD_STEP,
      );
      expect(result.current.contextValue.sizes.panel2).toBe(
        1000 - DEFAULT_KEYBOARD_STEP,
      );
    });

    it("should resize panels by custom step", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          1,
          LARGE_KEYBOARD_STEP,
        );
      });

      // LARGE_KEYBOARD_STEP is 100 for fr panels
      expect(result.current.contextValue.sizes.panel1).toBe(
        1000 + LARGE_KEYBOARD_STEP,
      );
      expect(result.current.contextValue.sizes.panel2).toBe(
        1000 - LARGE_KEYBOARD_STEP,
      );
    });

    it("should resize in negative direction", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          -1,
        );
      });

      expect(result.current.contextValue.sizes.panel1).toBe(
        1000 - DEFAULT_KEYBOARD_STEP,
      );
      expect(result.current.contextValue.sizes.panel2).toBe(
        1000 + DEFAULT_KEYBOARD_STEP,
      );
    });

    it("should not resize if result would be <= 0", () => {
      const smallPanels: PanelConfig[] = [
        { id: "panel1", defaultSize: 30, constraints: { minSize: 10 } },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: smallPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          -1,
        );
      });

      // Should not change because newBeforeSize would be <= 0 (30 - 50 = -20)
      expect(result.current.contextValue.sizes.panel1).toBe(30);
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should persist layout to localStorage after resize", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          1,
        );
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(1000 + DEFAULT_KEYBOARD_STEP);
    });

    it("should resize px panel by pixel step (20px)", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-keyboard", panels: pxFrPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "vertical",
          ["panel1", "panel2"],
          1,
        );
      });

      // px panels use 20px step by default
      expect(result.current.contextValue.sizes.panel1).toBe(320);
      // fr panel should remain unchanged
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should resize px panel by large pixel step (50px) when using large step", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-keyboard-large", panels: pxFrPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "vertical",
          ["panel1", "panel2"],
          1,
          LARGE_KEYBOARD_STEP,
        );
      });

      // Large step for px panels is 50px
      expect(result.current.contextValue.sizes.panel1).toBe(350);
    });

    it("should not resize px panel below minimum (100px)", () => {
      const smallPxPanels: PanelConfig[] = [
        {
          id: "panel1",
          defaultSize: 110,
          sizeUnit: "px",
          constraints: { minSize: 100 },
        },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-min", panels: smallPxPanels }),
      );

      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "vertical",
          ["panel1", "panel2"],
          -1,
        );
      });

      // Should not go below 100px
      expect(result.current.contextValue.sizes.panel1).toBe(110);
    });
  });

  describe("constraints", () => {
    it("should apply minSize constraint", () => {
      const constrainedPanels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000, constraints: { minSize: 500 } },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: constrainedPanels }),
      );

      // Try to resize panel1 below minSize
      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          -1,
          600, // Would bring panel1 to 400, below minSize
        );
      });

      expect(result.current.contextValue.sizes.panel1).toBeGreaterThanOrEqual(
        500,
      );
    });

    it("should apply maxSize constraint", () => {
      const constrainedPanels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000, constraints: { maxSize: 1500 } },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: constrainedPanels }),
      );

      // Try to resize panel1 above maxSize
      act(() => {
        result.current.contextValue.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          1,
          600, // Would bring panel1 to 1600, above maxSize
        );
      });

      expect(result.current.contextValue.sizes.panel1).toBeLessThanOrEqual(
        1500,
      );
    });

    it("should apply default minSize of 100px for px panels when setSizes is called", () => {
      const pxPanelsNoConstraint: PanelConfig[] = [
        { id: "panel1", defaultSize: 200, sizeUnit: "px" },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({
          id: "test-px-default-min",
          panels: pxPanelsNoConstraint,
        }),
      );

      // Try to resize below default min (100px) using resizeToMin
      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      // Should be clamped to minimum 100px
      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });

    it("should apply default minSize of 100 for fr panels when setSizes is called", () => {
      const frPanelsNoConstraint: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000 },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({
          id: "test-fr-default-min",
          panels: frPanelsNoConstraint,
        }),
      );

      // resizeToMin uses default minSize of 100 for fr panels
      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      // Should be clamped to minimum 100fr
      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });
  });

  describe("getContainerRef", () => {
    it("should return null when no container", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.contextValue.getContainerRef()).toBeNull();
    });
  });

  describe("resizeToMin", () => {
    it("should shrink before panel to minimum size on Home", () => {
      const panelsWithMinSize: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000, constraints: { minSize: 200 } },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: panelsWithMinSize }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(200);
      expect(result.current.contextValue.sizes.panel2).toBe(1800);
    });

    it("should shrink after panel to minimum size on End", () => {
      const panelsWithMinSize: PanelConfig[] = [
        { id: "panel1", defaultSize: 1000 },
        { id: "panel2", defaultSize: 1000, constraints: { minSize: 300 } },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: panelsWithMinSize }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel2");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(1700);
      expect(result.current.contextValue.sizes.panel2).toBe(300);
    });

    it("should use default minSize of 100 when no constraint is set", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(100);
      expect(result.current.contextValue.sizes.panel2).toBe(1900);
    });

    it("should shrink px panel to minimum size (directly set value)", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-resize-min", panels: pxFrPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      // px panel should be set directly to minSize
      expect(result.current.contextValue.sizes.panel1).toBe(100);
      // fr panel should remain unchanged (CSS grid handles the rest)
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should use default minSize of 100px for px panel when no constraint", () => {
      const pxPanelNoConstraint: PanelConfig[] = [
        { id: "panel1", defaultSize: 300, sizeUnit: "px" },
        { id: "panel2", defaultSize: 1000 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({
          id: "test-px-no-constraint",
          panels: pxPanelNoConstraint,
        }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      // Should use default 100px for px panels
      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });

    it("should persist layout to localStorage after resizeToMin", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(100);
    });

    it("should not change sizes if panel sizes are undefined", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      // Manually set sizes to undefined (shouldn't happen in practice)
      act(() => {
        // This should not throw or change anything
        result.current.contextValue.resizeToMin(
          ["nonexistent1", "nonexistent2"],
          "nonexistent1",
        );
      });

      // Original sizes should remain unchanged
      expect(result.current.contextValue.sizes.panel1).toBe(1000);
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });
  });

  describe("exported constants", () => {
    it("should export DEFAULT_KEYBOARD_STEP as 50", () => {
      expect(DEFAULT_KEYBOARD_STEP).toBe(50);
    });

    it("should export LARGE_KEYBOARD_STEP as 100", () => {
      expect(LARGE_KEYBOARD_STEP).toBe(100);
    });
  });

  describe("resizeToFit", () => {
    it("should not resize if getOptimalSize returns null", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => null,
        );
      });

      // Sizes should remain unchanged
      expect(result.current.contextValue.sizes.panel1).toBe(1000);
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should not resize if container is not available", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => 200,
        );
      });

      // Sizes should remain unchanged because container is null
      expect(result.current.contextValue.sizes.panel1).toBe(1000);
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should not resize if panel sizes are undefined", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["nonexistent1", "nonexistent2"],
          "nonexistent1",
          () => 200,
        );
      });

      // Original sizes should remain unchanged
      expect(result.current.contextValue.sizes.panel1).toBe(1000);
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should resize panels based on optimal size for vertical orientation", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      // Create a mock container with panels
      const container = document.createElement("div");
      const panel1 = document.createElement("div");
      panel1.setAttribute("data-panel-id", "panel1");
      const panel2 = document.createElement("div");
      panel2.setAttribute("data-panel-id", "panel2");
      container.appendChild(panel1);
      container.appendChild(panel2);

      // Mock getBoundingClientRect for height (vertical orientation)
      panel1.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 0,
        left: 0,
        bottom: 200,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      panel2.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 200,
        left: 0,
        bottom: 400,
        right: 100,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      });

      // Manually set containerRef
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        // Request optimal size of 300px for panel1 (total is 400px)
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => 300,
        );
      });

      // panel1 should be 75% of total fr (300/400 = 0.75)
      // totalFr = 2000, so panel1 = 1500, panel2 = 500
      expect(result.current.contextValue.sizes.panel1).toBe(1500);
      expect(result.current.contextValue.sizes.panel2).toBe(500);
    });

    it("should resize panels based on optimal size for horizontal orientation", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      // Create a mock container with panels
      const container = document.createElement("div");
      const panel1 = document.createElement("div");
      panel1.setAttribute("data-panel-id", "panel1");
      const panel2 = document.createElement("div");
      panel2.setAttribute("data-panel-id", "panel2");
      container.appendChild(panel1);
      container.appendChild(panel2);

      // Mock getBoundingClientRect for width (horizontal orientation)
      panel1.getBoundingClientRect = () => ({
        height: 100,
        width: 200,
        top: 0,
        left: 0,
        bottom: 100,
        right: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      panel2.getBoundingClientRect = () => ({
        height: 100,
        width: 200,
        top: 0,
        left: 200,
        bottom: 100,
        right: 400,
        x: 200,
        y: 0,
        toJSON: () => ({}),
      });

      // Manually set containerRef
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        // Request optimal size of 100px for panel1 (total width is 400px)
        result.current.contextValue.resizeToFit(
          "sep1",
          "horizontal",
          ["panel1", "panel2"],
          "panel1",
          () => 100,
        );
      });

      // panel1 should be 25% of total fr (100/400 = 0.25)
      // totalFr = 2000, so panel1 = 500, panel2 = 1500
      expect(result.current.contextValue.sizes.panel1).toBe(500);
      expect(result.current.contextValue.sizes.panel2).toBe(1500);
    });

    it("should resize after panel when it is the target", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      // Create a mock container with panels
      const container = document.createElement("div");
      const panel1 = document.createElement("div");
      panel1.setAttribute("data-panel-id", "panel1");
      const panel2 = document.createElement("div");
      panel2.setAttribute("data-panel-id", "panel2");
      container.appendChild(panel1);
      container.appendChild(panel2);

      // Mock getBoundingClientRect
      panel1.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 0,
        left: 0,
        bottom: 200,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      panel2.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 200,
        left: 0,
        bottom: 400,
        right: 100,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      });

      // Manually set containerRef
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        // Request optimal size of 300px for panel2 (after panel)
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel2",
          () => 300,
        );
      });

      // panel2 should be 75% of total fr (300/400 = 0.75)
      // totalFr = 2000, so panel2 = 1500, panel1 = 500
      expect(result.current.contextValue.sizes.panel1).toBe(500);
      expect(result.current.contextValue.sizes.panel2).toBe(1500);
    });

    it("should clamp ratio between 0.05 and 0.95", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      // Create a mock container with panels
      const container = document.createElement("div");
      const panel1 = document.createElement("div");
      panel1.setAttribute("data-panel-id", "panel1");
      const panel2 = document.createElement("div");
      panel2.setAttribute("data-panel-id", "panel2");
      container.appendChild(panel1);
      container.appendChild(panel2);

      // Mock getBoundingClientRect
      panel1.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 0,
        left: 0,
        bottom: 200,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      panel2.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 200,
        left: 0,
        bottom: 400,
        right: 100,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      });

      // Manually set containerRef
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        // Request a very large optimal size that would exceed 95%
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => 1000, // Way larger than total
        );
      });

      // Ratio should be clamped to 0.95
      // totalFr = 2000, so panel1 = 1900, panel2 = 100
      expect(result.current.contextValue.sizes.panel1).toBe(1900);
      expect(result.current.contextValue.sizes.panel2).toBe(100);
    });

    it("should persist layout to localStorage after resizeToFit", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-persist", panels: defaultPanels }),
      );

      // Create a mock container with panels
      const container = document.createElement("div");
      const panel1 = document.createElement("div");
      panel1.setAttribute("data-panel-id", "panel1");
      const panel2 = document.createElement("div");
      panel2.setAttribute("data-panel-id", "panel2");
      container.appendChild(panel1);
      container.appendChild(panel2);

      // Mock getBoundingClientRect
      panel1.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 0,
        left: 0,
        bottom: 200,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      panel2.getBoundingClientRect = () => ({
        height: 200,
        width: 100,
        top: 200,
        left: 0,
        bottom: 400,
        right: 100,
        x: 0,
        y: 200,
        toJSON: () => ({}),
      });

      // Manually set containerRef
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => 300,
        );
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test-persist");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(1500);
    });

    it("should directly set pixel value for px panel", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-fit", panels: pxFrPanels }),
      );

      // Create a mock container (required by resizeToFit)
      const container = document.createElement("div");
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => 250,
        );
      });

      // px panel should be set directly to optimal size
      expect(result.current.contextValue.sizes.panel1).toBe(250);
      // fr panel should remain unchanged
      expect(result.current.contextValue.sizes.panel2).toBe(1000);
    });

    it("should persist px panel size to localStorage after resizeToFit", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-px-fit-persist", panels: pxFrPanels }),
      );

      // Create a mock container (required by resizeToFit)
      const container = document.createElement("div");
      (result.current.containerRef as { current: HTMLDivElement }).current =
        container;

      act(() => {
        result.current.contextValue.resizeToFit(
          "sep1",
          "vertical",
          ["panel1", "panel2"],
          "panel1",
          () => 400,
        );
      });

      const stored = localStorage.getItem(
        STORAGE_KEY_PREFIX + "test-px-fit-persist",
      );
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(400);
    });
  });
});
