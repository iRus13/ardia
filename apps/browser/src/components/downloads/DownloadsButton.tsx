import { View } from "react-native";
import { useShortcutHint, withShortcut } from "../../state/commands/commandShortcuts";
import { toggleDownloadsOpen } from "../../state/windows/actions";
import { useWindowUiOf } from "../../state/windows/hooks";
import { SIDEBAR_FOOTER_DOWNLOADS } from "../sidebar/geometry";
import { Button } from "../ui";
import { useDownloadsAnchor } from "./downloadsAnchor";
import { DOWNLOADS_BUTTON } from "./tokens";

const DOWNLOADS_HIT = { width: SIDEBAR_FOOTER_DOWNLOADS.size, height: SIDEBAR_FOOTER_DOWNLOADS.size, plateX: 0, plateY: 0, box: SIDEBAR_FOOTER_DOWNLOADS.size, radius: DOWNLOADS_BUTTON.radius };

export function DownloadsButton({ windowId }: { windowId: string }) {
  const open = useWindowUiOf(windowId, (ui) => !!ui?.downloadsOpen);
  const hint = useShortcutHint("downloads");
  const view = useDownloadsAnchor(windowId, "downloads");
  return (
    <View ref={view} collapsable={false}>
      <Button variant="icon"
        icon="arrow.down.circle"
        glyph={DOWNLOADS_BUTTON.icon}
        hit={DOWNLOADS_HIT}
        active={open}
        tooltip={open ? undefined : withShortcut("Downloads", hint)}
        onPress={() => toggleDownloadsOpen(windowId)}
      />
    </View>
  );
}
