import { test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import {
  GridResizableContext,
  useGridResizableContext,
  type GridResizableContextValue,
} from "@/components/grid-resizable/grid-resizable-context";

test("should throw error when used outside provider", () => {
  expect(() => {
    renderHook(() => useGridResizableContext());
  }).toThrow(
    "useGridResizableContext must be used within GridResizablePanelGroup",
  );
});

test("should return context value when used within provider", () => {
  const mockContextValue: GridResizableContextValue = {
    sizes: { panel1: 1, panel2: 1 },
    panelConfigs: new Map(),
    startResize: () => {},
    updateResize: () => {},
    endResize: () => {},
    resizeByKeyboard: () => {},
    resizeToMin: () => {},
    getContainerRef: () => null,
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <GridResizableContext.Provider value={mockContextValue}>
      {children}
    </GridResizableContext.Provider>
  );

  const { result } = renderHook(() => useGridResizableContext(), { wrapper });
  expect(result.current).toBe(mockContextValue);
});
