import { expect, test } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePwaContext } from "@/lib/pwa/use-pwa-context";

test("throws error when used outside PwaContext.Provider", () => {
  expect(() => renderHook(() => usePwaContext())).toThrow(
    "usePwaContext must be used within PwaContext.Provider",
  );
});
