import { useRef } from "react";
import { Pressable, View } from "react-native";
import { useProfile } from "../../state/browser/hooks";
import { iconSymbol } from "../../lib/customIcon";
import { ContextMenuArea, Text, useTheme } from "../ui";
import { ProfileSymbol } from "../profiles/ProfileSymbol";
import { openProfileItemMenu } from "../profiles/profileMenu";
import { SPACE_HEADING, TAB_ROW } from "./tokens";

export function ProfileHeading({ profileId, windowId, fixedTiles, scrolledTiles }: { profileId: string; windowId: string; fixedTiles: boolean; scrolledTiles: boolean }) {
  const name = useProfile(profileId, (profile) => profile?.name ?? "");
  const icon = useProfile(profileId, (profile) => profile?.icon ?? null);
  const theme = useTheme();
  const anchor = useRef<View>(null);
  const open = () => void openProfileItemMenu(profileId, "sidebar", windowId, anchor.current);
  const symbol = iconSymbol(icon);
  return (
    <View ref={anchor} style={{ marginTop: fixedTiles ? SPACE_HEADING.afterFixedTiles : scrolledTiles ? SPACE_HEADING.afterScrolledTiles : 0, marginBottom: SPACE_HEADING.below }}>
      <ContextMenuArea onContextMenu={open}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${name} profile menu`} onPress={open}>
          <View style={{ height: SPACE_HEADING.height, flexDirection: "row", alignItems: "center", paddingLeft: TAB_ROW.contentLeft, gap: SPACE_HEADING.gap }}>
            <View style={{ width: SPACE_HEADING.icon, height: SPACE_HEADING.height, alignItems: "center", justifyContent: "center" }}>
              {symbol ? <ProfileSymbol name={symbol} size={SPACE_HEADING.icon} color={theme.textPrimary} style={{ width: SPACE_HEADING.icon, height: SPACE_HEADING.icon }} /> : icon ? <Text style={SPACE_HEADING.label}>{icon}</Text> : <ProfileSymbol name="circle.fill" size={SPACE_HEADING.icon} color={theme.textPrimary} style={{ width: SPACE_HEADING.icon, height: SPACE_HEADING.icon }} />}
            </View>
            <Text numberOfLines={1} weight="semibold" tone="textSecondary" style={[SPACE_HEADING.label, { flexShrink: 1 }]}>{name}</Text>
          </View>
        </Pressable>
      </ContextMenuArea>
    </View>
  );
}
