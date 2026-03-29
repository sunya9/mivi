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

  describe("element registration", () => {
    it("should register and unregister panel elements", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      const element = document.createElement("div");

      act(() => {
        result.current.contextValue.registerPanel("panel1", element);
      });

      // Verify registration works by using startResize (which reads panelElements)
      act(() => {
        result.current.contextValue.startResize("panel1", "before", "horizontal");
      });

      // If panel was registered, startResize should have set the resize state
      // (endResize will persist, confirming resize was active)
      act(() => {
        result.current.contextValue.endResize();
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test");
      expect(stored).not.toBeNull();

      // Unregister
      act(() => {
        result.current.contextValue.unregisterPanel("panel1");
      });
    });

    it("should register and unregister separator elements", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      const element = document.createElement("div");

      act(() => {
        result.current.contextValue.registerSeparator("sep1", element, "horizontal");
      });

      act(() => {
        result.current.contextValue.unregisterSeparator("sep1");
      });

      // No error thrown means registration/unregistration works
      expect(true).toBe(true);
    });
  });

  describe("startResize and updateResize", () => {
    it("should not start resize if panel is not registered", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.startResize("panel1", "before", "horizontal");
      });

      // updateResize should be a no-op since resize didn't start
      act(() => {
        result.current.contextValue.updateResize(500);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300);
    });

    it("should resize before panel based on mouse position", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      const panel = document.createElement("div");
      panel.getBoundingClientRect = () => ({
        left: 100,
        right: 400,
        top: 0,
        bottom: 300,
        width: 300,
        height: 300,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      });

      act(() => {
        result.current.contextValue.registerPanel("panel1", panel);
      });

      act(() => {
        result.current.contextValue.startResize("panel1", "before", "horizontal");
      });

      // fixedEdge = left = 100, mousePos = 350 → newSize = 250
      act(() => {
        result.current.contextValue.updateResize(350);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(250);
    });

    it("should resize after panel based on mouse position", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      const panel = document.createElement("div");
      panel.getBoundingClientRect = () => ({
        left: 100,
        right: 400,
        top: 0,
        bottom: 300,
        width: 300,
        height: 300,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      });

      act(() => {
        result.current.contextValue.registerPanel("panel1", panel);
      });

      act(() => {
        result.current.contextValue.startResize("panel1", "after", "horizontal");
      });

      // fixedEdge = right = 400, mousePos = 300 → newSize = 100
      act(() => {
        result.current.contextValue.updateResize(300);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(100);
    });

    it("should resize vertical panel using top/bottom edges", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      const panel = document.createElement("div");
      panel.getBoundingClientRect = () => ({
        left: 0,
        right: 300,
        top: 50,
        bottom: 450,
        width: 300,
        height: 400,
        x: 0,
        y: 50,
        toJSON: () => ({}),
      });

      act(() => {
        result.current.contextValue.registerPanel("panel1", panel);
      });

      act(() => {
        result.current.contextValue.startResize("panel1", "before", "vertical");
      });

      // fixedEdge = top = 50, mousePos = 250 → newSize = 200
      act(() => {
        result.current.contextValue.updateResize(250);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(200);
    });

    it("should not update if resize is not active", () => {
      const { result } = renderHook(() => useGridResizable({ id: "test", panels: defaultPanels }));

      act(() => {
        result.current.contextValue.updateResize(500);
      });

      expect(result.current.contextValue.sizes.panel1).toBe(300);
    });
  });

  describe("endResize", () => {
    it("should persist layout on end", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-end", panels: defaultPanels }),
      );

      const panel = document.createElement("div");
      panel.getBoundingClientRect = () => ({
        left: 100,
        right: 400,
        top: 0,
        bottom: 300,
        width: 300,
        height: 300,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      });

      act(() => {
        result.current.contextValue.registerPanel("panel1", panel);
      });

      act(() => {
        result.current.contextValue.startResize("panel1", "before", "horizontal");
      });

      act(() => {
        result.current.contextValue.updateResize(350);
      });

      act(() => {
        result.current.contextValue.endResize();
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test-end");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!) as { sizes: Record<string, number> };
      expect(parsed.sizes.panel1).toBe(250);
    });

    it("should not persist if resize was not active", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-no-resize", panels: defaultPanels }),
      );

      act(() => {
        result.current.contextValue.endResize();
      });

      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + "test-no-resize");
      expect(stored).toBeNull();
    });

    it("should clamp to rendered size if panel is smaller than internal value", () => {
      const { result } = renderHook(() =>
        useGridResizable({ id: "test-clamp", panels: defaultPanels }),
      );

      const panel = document.createElement("div");
      // Initial getBoundingClientRect for startResize
      panel.getBoundingClientRect = () => ({
        left: 0,
        right: 300,
        top: 0,
        bottom: 300,
        width: 300,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      act(() => {
        result.current.contextValue.registerPanel("panel1", panel);
      });

      act(() => {
        result.current.contextValue.startResize("panel1", "before", "horizontal");
      });

      // Drag to 800px
      act(() => {
        result.current.contextValue.updateResize(800);
      });

      // But CSS Grid renders it at only 500px
      panel.getBoundingClientRect = () => ({
        left: 0,
        right: 500,
        top: 0,
        bottom: 300,
        width: 500,
        height: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      act(() => {
        result.current.contextValue.endResize();
      });

      expect(result.current.contextValue.sizes.panel1).toBe(500);
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
