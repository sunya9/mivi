import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useGridResizable,
  DEFAULT_KEYBOARD_STEP,
  LARGE_KEYBOARD_STEP,
} from "@/components/grid-resizable/use-grid-resizable";
import type { PanelConfig } from "@/components/grid-resizable/types";

const STORAGE_KEY_PREFIX = "grid-resizable:";

describe("useGridResizable", () => {
  const defaultPanels: PanelConfig[] = [
    { id: "panel1", defaultSize: 1 },
    { id: "panel2", defaultSize: 1 },
  ];

  describe("initialization", () => {
    it("should initialize with default sizes from panels", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 1,
        panel2: 1,
      });
    });

    it("should load sizes from localStorage if available", () => {
      const storedState = { sizes: { panel1: 0.5, panel2: 1.5 } };
      localStorage.setItem(
        STORAGE_KEY_PREFIX + "test",
        JSON.stringify(storedState),
      );

      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 0.5,
        panel2: 1.5,
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
        "--panel-panel1": "1fr",
        "--panel-panel2": "1fr",
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

      expect(result.current.contextValue.sizes.panel1).toBeCloseTo(
        1 + DEFAULT_KEYBOARD_STEP,
      );
      expect(result.current.contextValue.sizes.panel2).toBeCloseTo(
        1 - DEFAULT_KEYBOARD_STEP,
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

      expect(result.current.contextValue.sizes.panel1).toBeCloseTo(
        1 + LARGE_KEYBOARD_STEP,
      );
      expect(result.current.contextValue.sizes.panel2).toBeCloseTo(
        1 - LARGE_KEYBOARD_STEP,
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

      expect(result.current.contextValue.sizes.panel1).toBeCloseTo(
        1 - DEFAULT_KEYBOARD_STEP,
      );
      expect(result.current.contextValue.sizes.panel2).toBeCloseTo(
        1 + DEFAULT_KEYBOARD_STEP,
      );
    });

    it("should not resize if result would be <= 0", () => {
      const smallPanels: PanelConfig[] = [
        { id: "panel1", defaultSize: 0.01 },
        { id: "panel2", defaultSize: 1 },
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

      // Should not change because newBeforeSize would be <= 0
      expect(result.current.contextValue.sizes.panel1).toBe(0.01);
      expect(result.current.contextValue.sizes.panel2).toBe(1);
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
      expect(parsed.sizes.panel1).toBeCloseTo(1 + DEFAULT_KEYBOARD_STEP);
    });
  });

  describe("constraints", () => {
    it("should apply minSize constraint", () => {
      const constrainedPanels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1, constraints: { minSize: 0.5 } },
        { id: "panel2", defaultSize: 1 },
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
          0.6, // Would bring panel1 to 0.4, below minSize
        );
      });

      expect(result.current.contextValue.sizes.panel1).toBeGreaterThanOrEqual(
        0.5,
      );
    });

    it("should apply maxSize constraint", () => {
      const constrainedPanels: PanelConfig[] = [
        { id: "panel1", defaultSize: 1, constraints: { maxSize: 1.5 } },
        { id: "panel2", defaultSize: 1 },
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
          0.6, // Would bring panel1 to 1.6, above maxSize
        );
      });

      expect(result.current.contextValue.sizes.panel1).toBeLessThanOrEqual(1.5);
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
        { id: "panel1", defaultSize: 1, constraints: { minSize: 0.2 } },
        { id: "panel2", defaultSize: 1 },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: panelsWithMinSize }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(0.2);
      expect(result.current.contextValue.sizes.panel2).toBeCloseTo(1.8);
    });

    it("should shrink after panel to minimum size on End", () => {
      const panelsWithMinSize: PanelConfig[] = [
        { id: "panel1", defaultSize: 1 },
        { id: "panel2", defaultSize: 1, constraints: { minSize: 0.3 } },
      ];
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: panelsWithMinSize }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel2");
      });

      expect(result.current.contextValue.sizes.panel1).toBeCloseTo(1.7);
      expect(result.current.contextValue.sizes.panel2).toBe(0.3);
    });

    it("should use default minSize of 0.1 when no constraint is set", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToMin(["panel1", "panel2"], "panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(0.1);
      expect(result.current.contextValue.sizes.panel2).toBeCloseTo(1.9);
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
      expect(parsed.sizes.panel1).toBe(0.1);
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
      expect(result.current.contextValue.sizes.panel1).toBe(1);
      expect(result.current.contextValue.sizes.panel2).toBe(1);
    });
  });

  describe("exported constants", () => {
    it("should export DEFAULT_KEYBOARD_STEP as 0.05", () => {
      expect(DEFAULT_KEYBOARD_STEP).toBe(0.05);
    });

    it("should export LARGE_KEYBOARD_STEP as 0.1", () => {
      expect(LARGE_KEYBOARD_STEP).toBe(0.1);
    });
  });
});
