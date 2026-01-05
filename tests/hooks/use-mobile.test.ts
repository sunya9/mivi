import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let changeHandler: (() => void) | null = null;

  beforeEach(() => {
    changeHandler = null;
    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: window.innerWidth < 768,
      media: query,
      addEventListener: (_event: string, handler: () => void) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("matchMedia", mockMatchMedia);
  });

  afterEach(() => {
    vi.stubGlobal("innerWidth", originalInnerWidth);
    vi.unstubAllGlobals();
  });

  it("should return false when window width is >= 768", () => {
    vi.stubGlobal("innerWidth", 1024);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should return true when window width is < 768", () => {
    vi.stubGlobal("innerWidth", 500);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should update when window is resized", () => {
    vi.stubGlobal("innerWidth", 1024);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      vi.stubGlobal("innerWidth", 500);
      changeHandler?.();
    });

    expect(result.current).toBe(true);
  });

  it("should handle edge case at exactly 768px", () => {
    vi.stubGlobal("innerWidth", 768);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("should handle edge case at 767px", () => {
    vi.stubGlobal("innerWidth", 767);

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("should call matchMedia with correct query", () => {
    vi.stubGlobal("innerWidth", 1024);

    renderHook(() => useIsMobile());

    expect(mockMatchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });
});
