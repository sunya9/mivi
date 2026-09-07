import { act } from "@testing-library/react";
import { customRenderHook } from "tests/util";
import { expect, test } from "vitest";

import { useTheme } from "@/lib/theme/use-theme";

test("exposes the current theme and updates through the store", async () => {
  const { result, appContextValue } = await customRenderHook(() => useTheme());
  expect(result.current.theme).toBe("light");

  act(() => result.current.setTheme("dark"));

  expect(result.current.theme).toBe("dark");
  expect(appContextValue.themeStore.getSnapshot().resolvedTheme).toBe("dark");
});
