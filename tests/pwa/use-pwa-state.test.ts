import { expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePwaState } from "@/pwa/use-pwa-state";

/**
 * Note: vitest では実際の Service Worker API は利用できないため、
 * virtual:pwa-register/react は setup.ts でモックしています。
 *
 * このテストでは usePwaState の以下の機能をテストします:
 * - beforeinstallprompt イベントのハンドリング
 * - appinstalled イベントのハンドリング
 * - installPwa 関数の動作
 *
 * useRegisterSW からの返り値（needRefresh, offlineReady, updateServiceWorker）は
 * モックされているため、実際の Service Worker の動作はテストしていません。
 */

// Store original addEventListener/removeEventListener
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// Track event listeners
let eventListeners: Map<string, EventListener>;

beforeEach(() => {
  eventListeners = new Map();

  // Mock addEventListener to capture listeners
  window.addEventListener = vi.fn((type: string, listener: EventListener) => {
    eventListeners.set(type, listener);
  });

  window.removeEventListener = vi.fn((type: string) => {
    eventListeners.delete(type);
  });
});

afterEach(() => {
  window.addEventListener = originalAddEventListener;
  window.removeEventListener = originalRemoveEventListener;
});

test("usePwaState initializes with canInstall as false", () => {
  const { result } = renderHook(() => usePwaState());

  expect(result.current.canInstall).toBe(false);
});

test("usePwaState registers event listeners on mount", () => {
  renderHook(() => usePwaState());

  expect(window.addEventListener).toHaveBeenCalledWith(
    "beforeinstallprompt",
    expect.any(Function),
  );
  expect(window.addEventListener).toHaveBeenCalledWith(
    "appinstalled",
    expect.any(Function),
  );
});

test("usePwaState removes event listeners on unmount", () => {
  const { unmount } = renderHook(() => usePwaState());

  unmount();

  expect(window.removeEventListener).toHaveBeenCalledWith(
    "beforeinstallprompt",
    expect.any(Function),
  );
  expect(window.removeEventListener).toHaveBeenCalledWith(
    "appinstalled",
    expect.any(Function),
  );
});

test("usePwaState sets canInstall to true when beforeinstallprompt fires", async () => {
  const { result } = renderHook(() => usePwaState());

  // Simulate beforeinstallprompt event
  const mockEvent = {
    preventDefault: vi.fn(),
    prompt: vi.fn(),
    userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  };

  act(() => {
    const listener = eventListeners.get("beforeinstallprompt");
    listener?.(mockEvent as unknown as Event);
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(true);
  });
  expect(mockEvent.preventDefault).toHaveBeenCalled();
});

test("usePwaState sets canInstall to false when appinstalled fires", async () => {
  const { result } = renderHook(() => usePwaState());

  // First, trigger beforeinstallprompt to set canInstall to true
  const mockEvent = {
    preventDefault: vi.fn(),
    prompt: vi.fn(),
    userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  };

  act(() => {
    const listener = eventListeners.get("beforeinstallprompt");
    listener?.(mockEvent as unknown as Event);
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(true);
  });

  // Then trigger appinstalled
  act(() => {
    const listener = eventListeners.get("appinstalled");
    listener?.(new Event("appinstalled"));
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(false);
  });
});

test("usePwaState calls prompt() when installPwa is called", async () => {
  const { result } = renderHook(() => usePwaState());

  const mockPrompt = vi.fn();
  const mockEvent = {
    preventDefault: vi.fn(),
    prompt: mockPrompt,
    userChoice: Promise.resolve({ outcome: "accepted" as const }),
  };

  // Trigger beforeinstallprompt first
  act(() => {
    const listener = eventListeners.get("beforeinstallprompt");
    listener?.(mockEvent as unknown as Event);
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(true);
  });

  // Call installPwa
  await act(async () => {
    await result.current.installPwa();
  });

  expect(mockPrompt).toHaveBeenCalled();
});

test("usePwaState sets canInstall to false when user accepts install", async () => {
  const { result } = renderHook(() => usePwaState());

  const mockEvent = {
    preventDefault: vi.fn(),
    prompt: vi.fn(),
    userChoice: Promise.resolve({ outcome: "accepted" as const }),
  };

  // Trigger beforeinstallprompt
  act(() => {
    const listener = eventListeners.get("beforeinstallprompt");
    listener?.(mockEvent as unknown as Event);
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(true);
  });

  // Call installPwa and user accepts
  await act(async () => {
    await result.current.installPwa();
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(false);
  });
});

test("usePwaState keeps canInstall true when user dismisses install", async () => {
  const { result } = renderHook(() => usePwaState());

  const mockEvent = {
    preventDefault: vi.fn(),
    prompt: vi.fn(),
    userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  };

  // Trigger beforeinstallprompt
  act(() => {
    const listener = eventListeners.get("beforeinstallprompt");
    listener?.(mockEvent as unknown as Event);
  });

  await waitFor(() => {
    expect(result.current.canInstall).toBe(true);
  });

  // Call installPwa and user dismisses
  await act(async () => {
    await result.current.installPwa();
  });

  // canInstall should still be true since user dismissed
  expect(result.current.canInstall).toBe(true);
});

test("usePwaState does nothing when installPwa is called without beforeinstallprompt", async () => {
  const { result } = renderHook(() => usePwaState());

  // Call installPwa without beforeinstallprompt event
  await act(async () => {
    await result.current.installPwa();
  });

  // Should not throw, just return early
  expect(result.current.canInstall).toBe(false);
});

test("usePwaState returns useRegisterSW values", () => {
  const { result } = renderHook(() => usePwaState());

  // These are mocked in setup.ts
  expect(result.current.needRefresh).toBeDefined();
  expect(result.current.offlineReady).toBeDefined();
  expect(result.current.updateServiceWorker).toBeDefined();
});
