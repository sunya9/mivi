import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readLicenseEntry, renderLicenseNotices } from "vite-plugins/license-notices";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe("readLicenseEntry", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "license-notices-"));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function writePackage(dir: string, pkg: Record<string, unknown>, licenseText?: string) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg));
    if (licenseText !== undefined) fs.writeFileSync(path.join(dir, "LICENSE"), licenseText);
  }

  test("resolves the owning package and its license file from a module id", () => {
    const pkgDir = path.join(root, "node_modules", ".pnpm", "foo@1.2.3", "node_modules", "foo");
    writePackage(pkgDir, { name: "foo", version: "1.2.3", license: "MPL-2.0" }, "Mozilla text\n");
    fs.mkdirSync(path.join(pkgDir, "dist"));

    expect(readLicenseEntry(path.join(pkgDir, "dist", "index.js"))).toEqual({
      name: "foo",
      version: "1.2.3",
      license: "MPL-2.0",
      text: "Mozilla text",
    });
  });

  test("skips nested package.json files without a name", () => {
    const pkgDir = path.join(root, "node_modules", "bar");
    writePackage(pkgDir, { name: "bar", version: "0.1.0", license: "MIT" });
    writePackage(path.join(pkgDir, "dist"), { type: "module" });

    expect(readLicenseEntry(path.join(pkgDir, "dist", "index.js"))).toEqual({
      name: "bar",
      version: "0.1.0",
      license: "MIT",
    });
  });

  test("returns undefined for modules outside node_modules", () => {
    writePackage(root, { name: "app", version: "0.0.0" });

    expect(readLicenseEntry(path.join(root, "src", "main.ts"))).toBeUndefined();
  });
});

describe("renderLicenseNotices", () => {
  test("lists packages sorted by name with their license text", () => {
    const markdown = renderLicenseNotices([
      { name: "zeta", version: "2.0.0", license: "MIT", text: "MIT text" },
      { name: "alpha", version: "1.0.0", license: "MPL-2.0", text: "MPL text" },
      { name: "beta", version: "3.0.0" },
    ]);

    expect(markdown).toBe(`# Licenses

The app bundles dependencies which contain the following licenses:

## alpha - 1.0.0 (MPL-2.0)

MPL text

## beta - 3.0.0

## zeta - 2.0.0 (MIT)

MIT text
`);
  });
});
