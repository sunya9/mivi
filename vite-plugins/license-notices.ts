import fs from "node:fs";
import path from "node:path";

import type { LicenseNotice } from "virtual:license-notices";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:license-notices";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const PLACEHOLDER = "__LICENSE_NOTICES__";

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

export function readLicenseEntry(moduleId: string): LicenseNotice | undefined {
  const pkgDir = findPackageDir(path.dirname(moduleId));
  if (!pkgDir) return undefined;
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8")) as {
    name: string;
    version?: string;
    license?: string;
  };
  const entry: LicenseNotice = { name: pkg.name, version: pkg.version ?? "0.0.0" };
  if (pkg.license) entry.license = pkg.license.trim();
  const licenseFile = fs.readdirSync(pkgDir).find((file) => licenseFilePattern.test(file));
  if (licenseFile) entry.text = fs.readFileSync(path.join(pkgDir, licenseFile), "utf-8").trim();
  return entry;
}

/** Dev has no bundle to inspect, so the declared dependencies stand in for it */
export function readDependencyEntries(root: string): LicenseNotice[] {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8")) as {
    dependencies?: Record<string, string>;
  };
  return sortEntries(
    Object.keys(pkg.dependencies ?? {}).flatMap(
      (name) => readLicenseEntry(path.join(root, "node_modules", name, "package.json")) ?? [],
    ),
  );
}

function sortEntries(entries: Iterable<LicenseNotice>): LicenseNotice[] {
  return [...entries].sort(
    (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  );
}

export function injectLicenseNotices(code: string, entries: Iterable<LicenseNotice>): string {
  return code.replace(PLACEHOLDER, () => JSON.stringify(sortEntries(entries)));
}

function collectEntries(
  chunks: Iterable<{ moduleIds: string[] }>,
  into: Map<string, LicenseNotice>,
): void {
  for (const chunk of chunks) {
    for (const moduleId of chunk.moduleIds) {
      if (moduleId.startsWith("\0") || !moduleId.includes("node_modules")) continue;
      const entry = readLicenseEntry(moduleId);
      if (entry) into.set(`${entry.name}@${entry.version}`, entry);
    }
  }
}

/**
 * Exposes the licenses of every bundled dependency as `virtual:license-notices`.
 *
 * Vite's built-in `build.license` skips worker sub-builds, so dependencies that are only
 * imported from workers (mediabunny among them) would be missing. The worker plugin records
 * what each worker bundle pulled in, and the main plugin merges that with its own chunk graph
 * when the virtual module's chunk is rendered, which is before file hashes are computed.
 */
export function createLicenseNotices() {
  const workerEntries = new Map<string, LicenseNotice>();

  return {
    plugin: (): Plugin => {
      let root = process.cwd();
      let isBuild = false;
      return {
        name: "license-notices",
        configResolved(config) {
          root = config.root;
          isBuild = config.command === "build";
        },
        resolveId(id) {
          if (id === VIRTUAL_ID) return RESOLVED_ID;
        },
        load(id) {
          if (id !== RESOLVED_ID) return;
          const value = isBuild ? PLACEHOLDER : JSON.stringify(readDependencyEntries(root));
          return `export default ${value};`;
        },
        renderChunk(code, chunk, _options, meta) {
          if (!chunk.moduleIds.includes(RESOLVED_ID)) return;
          const entries = new Map(workerEntries);
          collectEntries(Object.values(meta.chunks), entries);
          return injectLicenseNotices(code, entries.values());
        },
      };
    },
    workerPlugin: (): Plugin => ({
      name: "license-notices:worker",
      apply: "build",
      generateBundle(_, bundle) {
        collectEntries(
          Object.values(bundle).filter((output) => output.type === "chunk"),
          workerEntries,
        );
      },
    }),
  };
}
