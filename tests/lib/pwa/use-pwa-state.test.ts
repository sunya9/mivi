import { expect, test, vi } from "vitest";
import { renderHook, waitFor, fireEvent } from "@testing-library/react";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

function createBeforeInstallPromptEvent(
  overrides: Partial<
    Pick<BeforeInstallPromptEvent, "prompt" | "userChoice">
  > = {},
): BeforeInstallPromptEvent {
  return {
    ...new Event("beforeinstallprompt"),
    prompt: vi.fn(),
    platforms: [],
    userChoice: Promise.resolve({
      outcome: "accepted" as const,
      platform: "",
    }),
    ...overrides,
  } satisfies BeforeInstallPromptEvent;
}

test("usePwaState initializes with canInstall as false", () => {
  const { result } = renderHook(() => usePwaState());

  expect(result.current.canInstall).toBe(false);
});

test("usePwaState registers event listeners on mount", () => {
  const addEventListenerSpy = vi.spyOn(window, "addEventListener");
  renderHook(() => usePwaState());
  expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    "beforeinstallprompt",
    expect.any(Function),
  );
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    "appinstalled",
    expect.any(Function),
  );
});

test("usePwaState removes event listeners on unmount", () => {
  const { unmount } = renderHook(() => usePwaState());
  const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

  unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    "beforeinstallprompt",
    expect.any(Function),
  );
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    "appinstalled",
    expect.any(Function),
  );
});

test("usePwaState sets canInstall to true when beforeinstallprompt fires", () => {
  const { result } = renderHook(() => usePwaState());

  const event = createBeforeInstallPromptEvent();
  vi.spyOn(event, "preventDefault");
  fireEvent(window, event);
  expect(result.current.canInstall).toBe(true);
  expect(event.preventDefault).toHaveBeenCalled();
});

test("usePwaState sets canInstall to false when appinstalled fires", () => {
  const { result } = renderHook(() => usePwaState());

  const event = createBeforeInstallPromptEvent();
  vi.spyOn(event, "preventDefault");
  fireEvent(window, event);
  expect(result.current.canInstall).toBe(true);

  const appInstalledEvent = new Event("appinstalled");
  fireEvent(window, appInstalledEvent);
  expect(result.current.canInstall).toBe(false);
});

test("usePwaState calls prompt() when installPwa is called", async () => {
  const { result } = renderHook(() => usePwaState());

  const event = createBeforeInstallPromptEvent();
  vi.spyOn(event, "preventDefault");
  fireEvent(window, event);
  expect(result.current.canInstall).toBe(true);

  const installResult = await result.current.installPwa();
  expect(installResult).toBe(true);

  expect(event.prompt).toHaveBeenCalled();
});

test("usePwaState sets canInstall to false when user accepts install", async () => {
  const { result } = renderHook(() => usePwaState());

  const event = createBeforeInstallPromptEvent();
  vi.spyOn(event, "preventDefault");
  fireEvent(window, event);

  expect(result.current.canInstall).toBe(true);

  // Call installPwa and user accepts
  await result.current.installPwa();
  expect(result.current.canInstall).toBe(true);

  await waitFor(() => {
    expect(result.current.canInstall).toBe(false);
  });
});

test("usePwaState returns false and keeps canInstall true when user dismisses install", async () => {
  const { result } = renderHook(() => usePwaState());

  const event = createBeforeInstallPromptEvent({
    userChoice: Promise.resolve({ outcome: "dismissed", platform: "" }),
  });
  vi.spyOn(event, "preventDefault");
  fireEvent(window, event);

  await waitFor(() => {
    expect(result.current.canInstall).toBe(true);
  });

  const installResult = await result.current.installPwa();

  // prompt() should still be called even when dismissed
  expect(event.prompt).toHaveBeenCalled();
  // installPwa returns false when not accepted
  expect(installResult).toBe(false);
  // canInstall remains true so user can try again
  expect(result.current.canInstall).toBe(true);
});

test("usePwaState does nothing when installPwa is called without beforeinstallprompt", async () => {
  const { result } = renderHook(() => usePwaState());

  const installResult = await result.current.installPwa();
  expect(installResult).toBe(false);
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
