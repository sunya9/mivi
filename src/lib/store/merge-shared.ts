import type { DeepPartial } from "@/lib/type-utils";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

/** Deep merge that reuses every untouched object, so slice selectors keep their identity */
export function mergeShared<T extends object>(prev: T, partial: DeepPartial<T>): T {
  let next: T | undefined;
  const patch = partial as Partial<Record<keyof T, unknown>>;
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key];
    if (value === undefined) continue;
    const current = prev[key];
    const merged =
      isPlainObject(current) && isPlainObject(value)
        ? mergeShared(current, value as DeepPartial<typeof current>)
        : value;
    if (Object.is(current, merged)) continue;
    next ??= { ...prev };
    next[key] = merged as T[keyof T];
  }
  return next ?? prev;
}
