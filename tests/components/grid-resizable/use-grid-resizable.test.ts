import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useGridResizable,
  DEFAULT_STEP,
  LARGE_STEP,
} from "@/components/grid-resizable/use-grid-resizable";
import type { PanelConfig } from "@/components/grid-resizable/types";

const STORAGE_KEY_PREFIX = "grid-resizable:v3:";

describe("useGridResizable", () => {
  const defaultPanels: PanelConfig[] = [
    { id: "panel1", defaultSize: 300 },
    { id: "panel2", defaultSize: 400 },
  ];

  describe("initialization", () => {
    it("should initialize with default sizes from panels", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 300,
        panel2: 400,
      });
    });

    it("should load sizes from localStorage if available", () => {
      const storedState = { sizes: { panel1: 200, panel2: 500 } };
      localStorage.setItem(STORAGE_KEY_PREFIX + "test", JSON.stringify(storedState));

      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      expect(result.current.contextValue.sizes).toEqual({
        panel1: 200,
        panel2: 500,
      });
    });

    it("should return panelConfigs as a Map", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      expect(result.current.contextValue.panelConfigs).toBeInstanceOf(Map);
      expect(result.current.contextValue.panelConfigs.get("panel1")).toEqual(defaultPanels[0]);
    });

    it("should provide containerRef", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));
      expect(result.current.containerRef).toBeDefined();
    });

    it("should generate panelStyles with px units", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      expect(result.current.panelStyles).toEqual({
        "--panel-panel1": "300px",
        "--panel-panel2": "400px",
      });
    });
  });

  describe("resizeByKeyboard", () => {
    it("should increase panel size by positive delta", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", DEFAULT_STEP, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300 + DEFAULT_STEP);
      expect(result.current.contextValue.sizes.panel2).toBe(400); // unchanged
    });

    it("should decrease panel size by negative delta", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", -DEFAULT_STEP, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300 - DEFAULT_STEP);
    });

    it("should resize by large step", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", LARGE_STEP, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300 + LARGE_STEP);
    });

    it("should not go below minSize constraint", () => {
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 150, constraints: { minSize: 100 } },
      ];
      const { result } = renderHook(() => useGridResizable({ id: "test", panels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", -100, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });

    it("should persist layout to localStorage after resize", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", DEFAULT_STEP, "horizontal");
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(300 + DEFAULT_STEP);
    });

    it("should not change sizes for nonexistent panel", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("nonexistent", 50, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300);
      expect(result.current.contextValue.sizes.panel2).toBe(400);
    });
  });

  describe("constraints", () => {
    it("should apply minSize constraint", () => {
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 300, constraints: { minSize: 200 } },
      ];
      const { result } = renderHook(() => useGridResizable({ id: "test", panels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", -200, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(200);
    });

    it("should apply maxSize constraint", () => {
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 300, constraints: { maxSize: 500 } },
      ];
      const { result } = renderHook(() => useGridResizable({ id: "test", panels }));

      act(() => {
        result.current.contextValue.resizeByKeyboard("panel1", 300, "horizontal");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(500);
    });

    it("should apply default minSize of 100 when no constraint is set", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToMin("panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });
  });

  describe("resizeToMin", () => {
    it("should shrink panel to minSize", () => {
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 300, constraints: { minSize: 150 } },
      ];
      const { result } = renderHook(() => useGridResizable({ id: "test", panels }));

      act(() => {
        result.current.contextValue.resizeToMin("panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(150);
    });

    it("should use default minSize of 100 when no constraint", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToMin("panel1");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });

    it("should persist layout to localStorage after resizeToMin", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToMin("panel1");
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(100);
    });

    it("should not change sizes for nonexistent panel", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToMin("nonexistent");
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300);
    });
  });

  describe("resizeToFit", () => {
    it("should set panel size to optimal value", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToFit("panel1", () => 250);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(250);
      expect(result.current.contextValue.sizes.panel2).toBe(400); // unchanged
    });

    it("should not resize if getOptimalSize returns undefined", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToFit("panel1", () => undefined);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300);
    });

    it("should apply constraints to optimal size", () => {
      const panels: PanelConfig[] = [
        { id: "panel1", defaultSize: 300, constraints: { minSize: 200 } },
      ];
      const { result } = renderHook(() => useGridResizable({ id: "test", panels }));

      act(() => {
        result.current.contextValue.resizeToFit("panel1", () => 50);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(200);
    });

    it("should persist layout to localStorage after resizeToFit", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-fit", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.resizeToFit("panel1", () => 250);
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test-fit");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(250);
    });

    it("should not resize nonexistent panel", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.resizeToFit("nonexistent", () => 200);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300);
    });
  });

  describe("exported constants", () => {
    it("should export DEFAULT_STEP as 20", () => {
      expect(DEFAULT_STEP).toBe(20);
    });

    it("should export LARGE_STEP as 50", () => {
      expect(LARGE_STEP).toBe(50);
    });
  });
});
