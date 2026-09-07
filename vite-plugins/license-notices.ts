import fs from "node:fs";
import path from "node:path";

import type { Plugin, Rolldown } from "vite";

export interface LicenseEntry {
  name: string;
  version: string;
  license?: string;
  text?: string;
}

const licenseFilePattern = /^(licen[cs]e|copying)/i;

function findPackageDir(fromDir: string): string | undefined {
  let dir = fromDir;
  while (dir.includes("node_modules") && path.basename(dir) !== "node_modules") {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { name?: string };
      if (pkg.name) return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
}

export function readLicenseEntry(moduleId: string): LicenseEntry | undefined {
  const pkgDir = findPackageDir(path.dirname(moduleId));
  if (!pkgDir) return undefined;
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8")) as {
    name: string;
    version?: string;
    license?: string;
  };
  const entry: LicenseEntry = { name: pkg.name, version: pkg.version ?? "0.0.0" };
  if (pkg.license) entry.license = pkg.license.trim();
  const licenseFile = fs.readdirSync(pkgDir).find((file) => licenseFilePattern.test(file));
  if (licenseFile) entry.text = fs.readFileSync(path.join(pkgDir, licenseFile), "utf-8").trim();
  return entry;
}

export function renderLicenseNotices(entries: LicenseEntry[]): string {
  const sorted = [...entries].sort(
    (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  );
  let text = "# Licenses\n\nThe app bundles dependencies which contain the following licenses:\n";
  for (const entry of sorted) {
    const identifier = entry.license ? ` (${entry.license})` : "";
    text += `\n## ${entry.name} - ${entry.version}${identifier}\n`;
    if (entry.text) text += `\n${entry.text}\n`;
  }
  return text;
}

/**
 * Vite's built-in `build.license` skips worker sub-builds, so dependencies that are only
 * imported from workers (mediabunny among them) never reach the generated file. This collector
 * runs in both the main build and every worker build and emits one file from the main build.
 */
export function createLicenseNotices(fileName: string) {
  const entries = new Map<string, LicenseEntry>();

  const collect = (bundle: Rolldown.OutputBundle) => {
    for (const output of Object.values(bundle)) {
      if (output.type !== "chunk") continue;
      for (const moduleId of output.moduleIds) {
        if (moduleId.startsWith("\0") || !moduleId.includes("node_modules")) continue;
        const entry = readLicenseEntry(moduleId);
        if (entry) entries.set(`${entry.name}@${entry.version}`, entry);
      }
    }
  };

  return {
    plugin: (): Plugin => ({
      name: "license-notices",
      apply: "build",
      generateBundle(_, bundle) {
        collect(bundle);
        this.emitFile({
          type: "asset",
          fileName,
          source: renderLicenseNotices([...entries.values()]),
        });
      },
    }),
    workerPlugin: (): Plugin => ({
      name: "license-notices:worker",
      apply: "build",
      generateBundle(_, bundle) {
        collect(bundle);
      },
    }),
  };
}
