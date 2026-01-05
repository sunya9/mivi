import { describe, it, expect, vi, beforeEach } from "vitest";
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

  beforeEach(() => {
    localStorage.clear();
  });

  describe("initialization", () => {
    it("should initialize with default sizes from panels", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.sizes).toEqual({
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

      expect(result.current.sizes).toEqual({
        panel1: 0.5,
        panel2: 1.5,
      });
    });

    it("should return panelConfigs as a Map", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.panelConfigs).toBeInstanceOf(Map);
      expect(result.current.panelConfigs.get("panel1")).toEqual(
        defaultPanels[0],
      );
      expect(result.current.panelConfigs.get("panel2")).toEqual(
        defaultPanels[1],
      );
    });

    it("should provide containerRef", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.containerRef).toBeDefined();
    });
  });

  describe("resizeByKeyboard", () => {
    it("should resize panels by default step", () => {
      const onLayoutChange = vi.fn();
      const { result } = renderHook(() =>
        useGridResizable({
          id: "test",
          panels: defaultPanels,
          onLayoutChange,
        }),
      );

      act(() => {
        result.current.resizeByKeyboard("horizontal", ["panel1", "panel2"], 1);
      });

      expect(result.current.sizes.panel1).toBeCloseTo(
        1 + DEFAULT_KEYBOARD_STEP,
      );
      expect(result.current.sizes.panel2).toBeCloseTo(
        1 - DEFAULT_KEYBOARD_STEP,
      );
    });

    it("should resize panels by custom step", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          1,
          LARGE_KEYBOARD_STEP,
        );
      });

      expect(result.current.sizes.panel1).toBeCloseTo(1 + LARGE_KEYBOARD_STEP);
      expect(result.current.sizes.panel2).toBeCloseTo(1 - LARGE_KEYBOARD_STEP);
    });

    it("should resize in negative direction", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.resizeByKeyboard("horizontal", ["panel1", "panel2"], -1);
      });

      expect(result.current.sizes.panel1).toBeCloseTo(
        1 - DEFAULT_KEYBOARD_STEP,
      );
      expect(result.current.sizes.panel2).toBeCloseTo(
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
        result.current.resizeByKeyboard("horizontal", ["panel1", "panel2"], -1);
      });

      // Should not change because newBeforeSize would be <= 0
      expect(result.current.sizes.panel1).toBe(0.01);
      expect(result.current.sizes.panel2).toBe(1);
    });

    it("should persist layout to localStorage after resize", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      act(() => {
        result.current.resizeByKeyboard("horizontal", ["panel1", "panel2"], 1);
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
        result.current.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          -1,
          0.6, // Would bring panel1 to 0.4, below minSize
        );
      });

      expect(result.current.sizes.panel1).toBeGreaterThanOrEqual(0.5);
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
        result.current.resizeByKeyboard(
          "horizontal",
          ["panel1", "panel2"],
          1,
          0.6, // Would bring panel1 to 1.6, above maxSize
        );
      });

      expect(result.current.sizes.panel1).toBeLessThanOrEqual(1.5);
    });
  });

  describe("onLayoutChange callback", () => {
    it("should call onLayoutChange when sizes change", () => {
      const onLayoutChange = vi.fn();
      const { result } = renderHook(() =>
        useGridResizable({
          id: "test",
          panels: defaultPanels,
          onLayoutChange,
        }),
      );

      act(() => {
        result.current.resizeByKeyboard("horizontal", ["panel1", "panel2"], 1);
      });

      expect(onLayoutChange).toHaveBeenCalled();
      expect(onLayoutChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sizes: expect.any(Object),
        }),
      );
    });
  });

  describe("getContainerRef", () => {
    it("should return null when no container", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test", panels: defaultPanels }),
      );

      expect(result.current.getContainerRef()).toBeNull();
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
