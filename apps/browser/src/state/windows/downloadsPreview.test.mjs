import assert from "node:assert/strict";
import { test } from "node:test";
import { useBrowser } from "../browser/store.ts";
import { closeDownloadsPreview, holdDownloadsPreview, leaveDownloadsPreview } from "./downloadsPreview.ts";

function setup(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  useBrowser.getState().hydrate({});
  const first = useBrowser.getState().createWindow({ url: "https://example.com" });
  const second = useBrowser.getState().createWindow({ url: "https://example.org" });
  t.after(() => { closeDownloadsPreview(first); closeDownloadsPreview(second); });
  return { first, second };
}

const ui = (windowId) => useBrowser.getState().windowUi[windowId];

test("moving from Library across the gap into the preview keeps it open, leaving both closes it", (t) => {
  const { first } = setup(t);
  holdDownloadsPreview(first, true);
  leaveDownloadsPreview(first, 180);
  t.mock.timers.tick(100);
  holdDownloadsPreview(first);
  t.mock.timers.tick(1000);
  assert.equal(ui(first).downloadsOpen, true);
  assert.equal(ui(first).downloadsPreview, true);
  leaveDownloadsPreview(first, 180);
  t.mock.timers.tick(179);
  assert.equal(ui(first).downloadsOpen, true);
  t.mock.timers.tick(1);
  assert.equal(ui(first).downloadsOpen, false);
});

test("an explicit Downloads action takes ownership from a preview and survives its pending hover exit", (t) => {
  const { first } = setup(t);
  holdDownloadsPreview(first, true);
  leaveDownloadsPreview(first, 180);
  useBrowser.getState().setDownloadsOpen(first, true);
  t.mock.timers.tick(1000);
  assert.equal(ui(first).downloadsOpen, true);
  assert.equal(ui(first).downloadsPreview, false);
  holdDownloadsPreview(first, true);
  leaveDownloadsPreview(first, 180);
  t.mock.timers.tick(1000);
  assert.equal(ui(first).downloadsOpen, true);
  assert.equal(ui(first).downloadsPreview, false);
});

test("hovering or leaving Library in one window does not close the other window's preview", (t) => {
  const { first, second } = setup(t);
  holdDownloadsPreview(first, true);
  holdDownloadsPreview(second, true);
  leaveDownloadsPreview(first, 180);
  holdDownloadsPreview(second);
  t.mock.timers.tick(1000);
  assert.equal(ui(first).downloadsOpen, false);
  assert.equal(ui(second).downloadsOpen, true);
  closeDownloadsPreview(second);
  assert.equal(ui(second).downloadsOpen, false);
});

test("a new download promotes the hover tray to a persistent download notification", (t) => {
  const { first } = setup(t);
  useBrowser.getState().setFocusedWindow(first);
  holdDownloadsPreview(first, true);
  leaveDownloadsPreview(first, 180);
  useBrowser.getState().upsertDownload({ id: "fresh", profile: "", path: "/tmp/synthetic-download.txt", state: "complete" });
  t.mock.timers.tick(1000);
  assert.equal(ui(first).downloadsOpen, true);
  assert.equal(ui(first).downloadsPreview, false);
});
