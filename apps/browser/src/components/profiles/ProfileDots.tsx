import { useRef, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { switchProfile } from "../../state/browser/actions";
import { noteSwitcherPress } from "../../state/telemetry/switcherPresses";
import { useTheme } from "../ui/theme";
import { useIsIncognito, useProfile, useSettings } from "../../state/browser/hooks";
import { useProfileOrder, useProfileRecords } from "../../state/profiles/hooks";
import { useNativePagerPosition, usePagerPages, type PagerPage } from "../../state/windows/profilePager";
import { ContextMenuArea, Symbol, useHover } from "../ui";
import { TooltipAbove } from "../ui/TooltipAbove";
import { switcherIcons, SwitcherMark } from "./ProfileIcons";
import { openProfileItemMenu } from "./profileMenu";
import { profileSwitcher } from "./tokens";
import { switcherCellSpan } from "./layout";
import { requestCreateProfile } from "../../state/profiles/createProfileRequest";
import { LibraryButton } from "./LibraryButton";

export const PROFILE_DOTS_HEIGHT = profileSwitcher.height;
const { band: BAND, dotTooltipLift } = profileSwitcher;
const SIDE_ROOM = profileSwitcher.inset;

export function useProfileDotsShown() {
  const incognito = useIsIncognito();
  const count = useProfileOrder((o) => o.length);
  return !incognito && count > 0;
}

export function ProfileDots({ windowId, width }: { windowId: string; width: number }) {
  const ids = useProfileOrder(useShallow((o) => o));
  const saved = useProfileRecords(useShallow((profiles) => ids.map((id) => profiles[id]?.icon ?? null)));
  const shown = useSettings((s) => s.profileSwitcherIcons);
  const room = width - 2 * SIDE_ROOM - 2 * profileSwitcher.controlCell;
  const icons = switcherIcons(saved, shown, room);
  const cell = switcherCellSpan(room, ids.length);
  const theme = useTheme();
  const { pages, pager } = usePagerPages(windowId);
  return (
    <View style={{ height: PROFILE_DOTS_HEIGHT, paddingHorizontal: SIDE_ROOM, justifyContent: "center" }}>
      <View style={{ height: BAND, flexDirection: "row", alignItems: "center" }}>
        <LibraryButton windowId={windowId} />
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
          {ids.map((id, i) => (
            <Dot key={id} id={id} windowId={windowId} icon={icons[i] ?? null} cell={cell} page={pages.find((p) => p.id === id)} pos={pager.pos} />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a Profile"
          tooltip="Create a Profile"
          onPress={() => void requestCreateProfile(windowId).then((id) => id && switchProfile(windowId, id, true))}
        >
          <View style={{ width: profileSwitcher.controlCell, height: BAND, alignItems: "center", justifyContent: "center", opacity: profileSwitcher.icons.idle }}>
            <Symbol name="plus" size={profileSwitcher.icon} weight="medium" color={theme.mark} style={{ width: profileSwitcher.iconCell, height: profileSwitcher.iconCell }} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function Dot({ id, windowId, icon, cell, page, pos }: { id: string; windowId: string; icon: string | null; cell: number; page: PagerPage | undefined; pos: Animated.Value }) {
  const theme = useTheme();
  useNativePagerPosition(windowId);
  const name = useProfile(id, (p) => p?.name ?? "");
  const { hovered, hoverProps } = useHover();
  const [pressed, setPressed] = useState(false);
  if (pressed && !hovered) setPressed(false);
  const levels = icon ? profileSwitcher.icons : profileSwitcher.dots;
  const rest = hovered ? levels.hovered : levels.idle;
  const opacity = page
    ? pos.interpolate({ inputRange: [page.slot - 1, page.slot, page.slot + 1], outputRange: [rest, levels.selected, rest], extrapolate: "clamp" })
    : rest;
  const mark = useRef<View>(null);
  return (
    <View {...hoverProps} ref={mark}>
      <TooltipAbove text={name} active={hovered && !pressed} centerX={cell / 2} bottom={BAND / 2 + dotTooltipLift} />
      <ContextMenuArea onContextMenu={() => void openProfileItemMenu(id, "sidebar", windowId, mark.current)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={name}
          onPress={() => {
            setPressed(true);
            noteSwitcherPress(windowId, id, !!icon);
            switchProfile(windowId, id, true);
          }}
        >
          <View style={{ width: cell, height: BAND, alignItems: "center", justifyContent: "center" }}>
            <Animated.View style={{ opacity }}>
              <SwitcherMark icon={icon} color={theme.mark} />
            </Animated.View>
          </View>
        </Pressable>
      </ContextMenuArea>
    </View>
  );
}
