import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "yus-fullscreen-edge-"));
const source = join(root, "packages/shell/ios/SidebarEdgeWatcher.swift");
const fixture = new URL("./fixtures/SidebarEdgeWatcherCheck.swift", import.meta.url);
const executable = join(scratch, "edge-check");
try {
  writeFileSync(join(scratch, "main.swift"), readFileSync(fixture));
  const build = spawnSync("swiftc", [source, join(scratch, "main.swift"), "-o", executable], { encoding: "utf8", timeout: 60000 });
  if (build.status !== 0) throw new Error(build.stderr || build.error?.message || "Native edge check compilation failed");
  const run = spawnSync(executable, [], { encoding: "utf8", timeout: 15000 });
  process.stdout.write(run.stdout);
  if (run.status !== 0) throw new Error(run.stderr || run.error?.message || "Native edge check failed");
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
