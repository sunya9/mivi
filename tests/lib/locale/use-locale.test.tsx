import { act } from "@testing-library/react";
import { customRenderHook } from "tests/util";
import { expect, test } from "vitest";

import { useLocale } from "@/lib/locale/use-locale";

test("exposes the current locale preference and updates through the store", async () => {
  const { result, appContextValue } = await customRenderHook(() => useLocale());
  expect(result.current).toMatchObject({ preference: "system", locale: "en" });

  act(() => result.current.setPreference("ja"));

  expect(result.current).toMatchObject({ preference: "ja", locale: "ja" });
  expect(appContextValue.localeStore.getSnapshot().locale).toBe("ja");
});
