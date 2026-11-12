import assert from "node:assert/strict";
import { test } from "node:test";
import { sidebarHeaderLayout } from "./headerLayout.ts";
import { navButtonsFitting } from "../window/dockMotion.ts";

test("windowed navigation leaves the native traffic lights their own row", () => {
  const windowed = sidebarHeaderLayout(false);
  const fullscreen = sidebarHeaderLayout(true);
  assert.ok(windowed.navigationCenter - 16 > 24 + 7);
  assert.equal(windowed.fieldTop - fullscreen.fieldTop, 32);
  assert.equal(windowed.height - fullscreen.height, 32);
  for (const header of [windowed, fullscreen]) {
    assert.ok(header.fieldTop >= header.navigationCenter + 16);
    assert.equal(header.height - header.fieldTop, 36);
  }
});

test("all navigation actions fit at the narrowest sidebar without overlapping the toggle", () => {
  const toggle = sidebarHeaderLayout(false).toggleCenter;
  for (const width of [160, 190, 212, 248, 400]) {
    const layout = navButtonsFitting(width, 30, true, toggle);
    assert.deepEqual(layout.buttons, ["back", "forward", "reload"]);
    assert.ok(layout.step >= 30);
  }
});

test("a hover-revealed sidebar uses the compact reference header without a spare traffic-light row", () => {
  assert.deepEqual(sidebarHeaderLayout(false, true), sidebarHeaderLayout(true));
  assert.equal(sidebarHeaderLayout(false, true).navigationCenter, 24);
  assert.equal(sidebarHeaderLayout(false, true).fieldTop, 46);
  assert.equal(sidebarHeaderLayout(false, true).height, 82);
});
