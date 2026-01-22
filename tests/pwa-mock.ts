import { PwaState } from "@/contexts/pwa-context";
import { vi } from "vitest";

/**
 * Default mock PwaState for testing.
 */
export function createMockPwaState(
  overrides: Partial<PwaState> = {},
): PwaState {
  return {
    needRefresh: [false, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
    canInstall: false,
    installPwa: vi.fn(),
    ...overrides,
  };
}
