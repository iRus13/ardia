import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
globalThis.require = createRequire(import.meta.url);

const space = (id, name, icon) => ({ id, name, icon, profileId: "", pinned: [], tabs: [] });
const favorite = (url, customIcon) => ({ url, title: url, customIcon, pinned: true, windowIndex: 0, active: false });
const profiles = {
  Default: { spaces: [space("work", "Work", "symbol:tray.full.fill"), space("media", "Media", "symbol:drop.triangle.fill")], favorites: [favorite("https://video.example/", "symbol:video.fill"), favorite("https://social.example/", "symbol:asterisk")] },
  School: { spaces: [space("study", "Study", "symbol:book.fill")], favorites: [favorite("https://mail.example/", "symbol:tray.full.fill")] },
};

globalThis.acTestNativeModules = {
  ArdiaImport: {
    addListener: () => ({ remove() {} }),
    isBrowserUnlocked: () => true,
    forgetUnlockedKeys() {},
    listExtensions: async () => "[]",
    importData: async (_job, browserId, profileId) => JSON.stringify({
      browserId, profileId, history: [], historyCount: 0, tabs: [], tabGroups: [], credentials: [], cookieCount: 0, addressCount: 0, cardCount: 0,
      spaces: profiles[profileId].spaces.map((s) => ({ ...s, profileId })), favorites: profiles[profileId].favorites, favicons: [], failed: [], warnings: [],
    }),
  },
};

const { useBrowser } = await import("../browser/store.ts");
const { useImportFlow } = await import("./flow.ts");
const { runImport } = await import("./runImport.ts");
const { dataIdOf } = await import("../profiles/profiles.ts");
const S = () => useBrowser.getState();

test("Arc spaces keep separate browser data groups while sharing ordered favorites and custom symbols within one group", async () => {
  useBrowser.setState({ bookmarks: { nodes: {} } });
  S().hydrate({});
  S().createWindow({ url: "https://keep.example/" });
  const existing = Object.keys(S().tabs);
  const source = { id: "arc", name: "Arc", family: "arc", sidebar: "arc", requiresExport: false, needsKeychain: false,
    profiles: Object.entries(profiles).map(([id, p]) => ({ id, name: id, path: id, isDefault: id === "Default", available: [], spaces: p.spaces.map((s) => ({ ...s, pinnedCount: 0, tabCount: 0 })) })) };
  useImportFlow.setState({ source, sourceProfiles: Object.keys(profiles), spaces: ["work", "media", "study"], target: "default", kinds: new Set(["spaces", "favorites"]), step: { name: "choose", error: null } });
  await runImport(new Set(["spaces", "favorites"]));
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(useImportFlow.getState().step.name, "done");
  assert.equal(S().profileOrder.length, 3);
  const first = S().profiles.default;
  const media = Object.values(S().profiles).find((p) => p.name === "Media");
  const study = Object.values(S().profiles).find((p) => p.name === "Study");
  assert.equal(dataIdOf(first), dataIdOf(media));
  assert.notEqual(dataIdOf(first), dataIdOf(study));
  assert.equal(first.shareTopApps, true);
  assert.equal(media.shareTopApps, true);
  assert.equal(first.icon, "symbol:tray.full.fill");
  assert.equal(media.icon, "symbol:drop.triangle.fill");
  assert.equal(study.icon, "symbol:book.fill");
  const own = (id) => Object.values(S().tabs).filter((tab) => tab.profileId === id && tab.pin?.as === "tile");
  assert.deepEqual(own(first.id).map((tab) => tab.customIcon), ["symbol:video.fill", "symbol:asterisk"]);
  assert.deepEqual(own(study.id).map((tab) => tab.customIcon), ["symbol:tray.full.fill"]);
  assert.ok(existing.every((id) => S().tabs[id]), "existing tabs remain in place");
});
