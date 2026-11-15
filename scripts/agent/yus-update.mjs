#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, realpathSync, renameSync, rmSync, rmdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const workspace = path.resolve(repo, "../..");
const derived = path.join(repo, "apps/browser/build-yus");
const source = path.join(derived, "Build/Products/Release/Ardia.app");
const destination = path.join(workspace, "outputs/Ѫ.app");
const staging = path.join(workspace, "outputs/.Ѫ-update.app");
const identity = "local.irus13.yus";
const xcconfig = path.join(workspace, "work/yus-build.xcconfig");
const lock = path.join(derived, ".yus-update-lock");
const args = new Set(process.argv.slice(2));
const allowed = new Set(["--apply", "--dry-run", "--build-only", "--install-only", "--help", "-h"]);

function fail(message) {
  throw new Error(message);
}

function run(command, argv, options = {}) {
  const result = spawnSync(command, argv, { cwd: repo, stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(`${command} failed (${result.status ?? result.signal})`);
}

function entryAt(target) {
  try {
    return lstatSync(target);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function safeApp(app) {
  const entry = entryAt(app);
  if (!entry) return;
  if (entry.isSymbolicLink() || !entry.isDirectory()) fail(`Expected an ordinary app directory: ${app}`);
  if (realpathSync(app) !== app) fail(`Refusing a redirected app path: ${app}`);
  const result = spawnSync("/usr/bin/plutil", ["-extract", "CFBundleIdentifier", "raw", "-o", "-", path.join(app, "Contents/Info.plist")], { encoding: "utf8" });
  if (result.error || result.status !== 0 || result.stdout.trim() !== identity) fail(`Refusing an app with an unexpected identity: ${app}`);
}

function installApp() {
  mkdirSync(path.dirname(destination), { recursive: true });
  if (realpathSync(path.dirname(destination)) !== path.dirname(destination)) fail("Refusing a redirected output directory.");
  if (entryAt(staging)) fail(`A previous staging bundle remains; inspect it before removing it: ${staging}`);
  try {
    const clone = spawnSync("/bin/cp", ["-cRp", source, staging], { encoding: "utf8" });
    if (clone.error || clone.status !== 0) {
      rmSync(staging, { recursive: true, force: true });
      run("/usr/bin/ditto", [source, staging]);
    }
    safeApp(staging);
    run("/usr/bin/codesign", ["--verify", "--deep", "--strict", staging]);
    safeApp(destination);
    requireStopped();
    if (existsSync(destination)) {
      run("/usr/bin/python3", ["-c", `import ctypes, os, sys
lib = ctypes.CDLL(None, use_errno=True)
swap = lib.renamex_np
swap.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_uint]
swap.restype = ctypes.c_int
if swap(os.fsencode(sys.argv[1]), os.fsencode(sys.argv[2]), 2):
    code = ctypes.get_errno()
    raise OSError(code, os.strerror(code))
`, staging, destination]);
    } else {
      renameSync(staging, destination);
    }
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

function requireStopped() {
  const result = spawnSync("/bin/ps", ["-axo", "comm="], { encoding: "utf8" });
  if (result.error || result.status !== 0) fail("Unable to check running apps; installation cancelled.");
  const running = result.stdout.split("\n").map((line) => line.trim());
  if (running.some((command) => [source, destination].some((app) => command.startsWith(app + "/")))) {
    fail("Quit Ѫ and its development instance before installing. This helper never stops processes.");
  }
}

try {
  for (const arg of args) if (!allowed.has(arg)) fail(`Unknown option: ${arg}`);
  if (args.has("--help") || args.has("-h")) {
    console.log("Usage: scripts/agent/yus-update.mjs [--apply] [--dry-run] [--build-only | --install-only]\nDefaults to a dry-run. --apply builds Release incrementally and updates outputs/Ѫ.app after you quit it. No permanent app backups, launches, profile changes or cache cleanup.");
  } else {
    if (args.has("--build-only") && args.has("--install-only")) fail("Choose only one of --build-only or --install-only.");
    const build = !args.has("--install-only");
    const install = !args.has("--build-only");
    const apply = args.has("--apply") && !args.has("--dry-run");
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", build, install, derivedData: derived, sourceApp: source, destinationApp: destination, temporaryStaging: staging, xcconfig }, null, 2));
    if (apply) {
      if (build && !existsSync(xcconfig)) fail(`Missing local signing configuration: ${xcconfig}`);
      safeApp(source);
      safeApp(destination);
      if (install) requireStopped();
      mkdirSync(derived, { recursive: true });
      mkdirSync(lock);
      try {
        if (build) run(path.join(repo, "scripts/agent/build-app"), ["--as", "yus", "--config", "Release"], { env: { ...process.env, XCODE_XCCONFIG_FILE: xcconfig } });
        if (install) {
          if (!existsSync(path.join(source, "Contents/Info.plist"))) fail("No Release app is available. Build it first.");
          safeApp(source);
          safeApp(destination);
          requireStopped();
          run("/usr/bin/codesign", ["--verify", "--deep", "--strict", source]);
          installApp();
          run("/usr/bin/codesign", ["--verify", "--deep", "--strict", destination]);
          console.log(`Updated: ${destination}`);
        }
      } finally {
        rmdirSync(lock);
      }
    }
  }
} catch (error) {
  console.error(`yus-update: ${error.message}`);
  process.exitCode = 1;
}
