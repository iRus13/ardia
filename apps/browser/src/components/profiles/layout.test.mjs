import assert from "node:assert/strict";
import { test } from "node:test";
import { switcherCellSpan } from "./layout.ts";
import { profileSwitcher } from "./tokens.ts";

test("three spaces keep the reference cadence between fixed Library and plus controls", () => {
  const width = 212;
  const inset = profileSwitcher.inset;
  const room = width - 2 * inset - 2 * profileSwitcher.controlCell;
  const cell = switcherCellSpan(room, 3);
  assert.equal(cell, 34);
  const start = inset + profileSwitcher.controlCell + (room - 3 * cell) / 2;
  assert.deepEqual([0, 1, 2].map((i) => start + cell * (i + 0.5)), [72, 106, 140]);
  assert.equal(inset + profileSwitcher.controlCell / 2, 24);
  assert.equal(width - inset - profileSwitcher.controlCell / 2, 188);
  assert.equal(profileSwitcher.controlCell, 32);
  assert.equal(profileSwitcher.band, 32);
  assert.equal(profileSwitcher.height / 2, 24);
});

test("narrow and crowded space groups stay inside their allotted center region", () => {
  for (const width of [160, 190, 212, 248, 400]) {
    const room = width - 2 * profileSwitcher.inset - 2 * profileSwitcher.controlCell;
    for (const count of [1, 3, 8, 20]) {
      const cell = switcherCellSpan(room, count);
      assert.ok(cell >= 0 && cell * count <= room + Number.EPSILON * 128);
      assert.ok(cell <= profileSwitcher.maxCell);
    }
  }
  assert.equal(switcherCellSpan(-1, 3), 0);
});
