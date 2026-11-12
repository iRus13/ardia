import assert from "node:assert/strict";
import { test } from "node:test";
import { sidebarHeaderLayout } from "./headerLayout.ts";
import { navButtonsFitting } from "../window/dockMotion.ts";
import { SIDEBAR_FIELD } from "./geometry.ts";
import { SPACE_HEADING, TAB_ROW } from "./tokens.ts";

test("windowed navigation shares the reference header row and leaves room beside the native traffic lights", () => {
  const windowed = sidebarHeaderLayout(false);
  const fullscreen = sidebarHeaderLayout(true);
  assert.equal(windowed.navigationCenter, 24);
  assert.equal(windowed.toggleCenter, 89);
  assert.ok(windowed.toggleCenter - 16 > 64 + 7);
  assert.equal(windowed.fieldTop, fullscreen.fieldTop);
  assert.equal(windowed.height, fullscreen.height);
  for (const header of [windowed, fullscreen]) {
    assert.ok(header.fieldTop >= header.navigationCenter + 16);
    assert.equal(header.height - header.fieldTop, 36);
  }
});

test("navigation actions fit beside the window controls without overlapping at every sidebar width", () => {
  for (const fullscreen of [false, true]) {
    const toggle = sidebarHeaderLayout(fullscreen).toggleCenter;
    for (const width of [160, 190, 212, 248, 400]) {
      const layout = navButtonsFitting(width, 30, true, toggle);
      assert.ok(layout.step >= 30);
      if (fullscreen || width >= 212) assert.deepEqual(layout.buttons, ["back", "forward", "reload"]);
      const last = width - 9 - 15;
      const first = last - (layout.buttons.length - 1) * layout.step;
      assert.ok(first - toggle >= 30);
    }
  }
});

test("a hover-revealed sidebar uses the compact reference header without a spare traffic-light row", () => {
  assert.deepEqual(sidebarHeaderLayout(false, true), sidebarHeaderLayout(true));
  assert.equal(sidebarHeaderLayout(false, true).navigationCenter, 24);
  assert.equal(sidebarHeaderLayout(false, true).fieldTop, 46);
  assert.equal(sidebarHeaderLayout(false, true).height, 82);
});

test("the reference sidebar aligns its glyphs and labels while keeping all three navigation buttons on the same row", () => {
  assert.equal(SIDEBAR_FIELD.inset + TAB_ROW.contentLeft + 8, 26);
  assert.equal(SIDEBAR_FIELD.inset + TAB_ROW.contentLeft + 16 + TAB_ROW.titleGap, 40);
  assert.equal(SIDEBAR_FIELD.inset + TAB_ROW.contentLeft + 16 + SPACE_HEADING.gap, 44);
  const { buttons, step } = navButtonsFitting(212.5, 30, true, sidebarHeaderLayout(false).toggleCenter, 7);
  assert.equal(buttons.length, 3);
  const centers = buttons.map((_, i) => 190.5 - (2 - i) * step);
  for (const [i, expected] of [122.5, 156.5, 190.5].entries()) assert.ok(Math.abs(centers[i] - expected) <= 0.5);
});
