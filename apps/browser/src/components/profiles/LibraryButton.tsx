import { useEffect, useMemo, useRef } from "react";
import { Animated, Image, Pressable, View } from "react-native";
import { markHoverProps } from "../../lib/hoverMarks";
import { runCommand } from "../../state/commands/commands";
import { showMenu } from "../../state/app/system";
import { openInternalPage } from "../../state/pages/urls";
import { ContextMenuArea, GlassFill, useGlass, useHover, useTheme } from "../ui";
import { reduceMotion } from "../ui/reduceMotion";
import { useWindowUiOf } from "../../state/windows/hooks";
import { useDownloadsAnchor } from "../downloads/downloadsAnchor";
import { useDownloadsPreview } from "../downloads/useDownloadsPreview";
import { closeDownloadsPreview } from "../../state/windows/downloadsPreview";
import { DOWNLOADS_BUTTON } from "../downloads/tokens";
import { LIBRARY_MOTION, profileSwitcher } from "./tokens";

const LIBRARY_ICON = require("./assets/library.png");

async function showLibraryMenu(windowId: string) {
  const choice = await showMenu([
    { id: "manageBookmarks", title: "Bookmarks", symbol: "book.fill" },
    { id: "showHistory", title: "History", symbol: "clock.arrow.circlepath" },
    { id: "downloads", title: "Downloads", symbol: "arrow.down.circle" },
  ]);
  if (choice === "manageBookmarks" || choice === "showHistory" || choice === "downloads") runCommand({ command: choice, arg: null, windowId });
}

export function LibraryButton({ windowId }: { windowId: string }) {
  const theme = useTheme();
  const glass = useGlass();
  const { hovered, hoverProps } = useHover();
  const previewHover = useDownloadsPreview(windowId, true);
  const hover = useMemo(() => markHoverProps({
    onMouseEnter: () => { hoverProps.onMouseEnter(); previewHover.onMouseEnter(); },
    onMouseLeave: () => { hoverProps.onMouseLeave(); previewHover.onMouseLeave(); },
  }), [hoverProps, previewHover]);
  const preview = useWindowUiOf(windowId, (ui) => !!ui?.downloadsPreview);
  const anchor = useDownloadsAnchor(windowId, "library");
  const progress = useRef(new Animated.Value(0)).current;
  const lit = hovered || preview;
  useEffect(() => {
    if (reduceMotion()) {
      progress.setValue(lit ? 1 : 0);
      return;
    }
    const animation = Animated.spring(progress, { toValue: lit ? 1 : 0, ...LIBRARY_MOTION.spring, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [lit, progress]);
  useEffect(() => () => closeDownloadsPreview(windowId), [windowId]);
  const { controlCell, band, libraryIcon, icons } = profileSwitcher;
  return (
    <View ref={anchor} collapsable={false} {...hover}>
      <ContextMenuArea onContextMenu={() => { closeDownloadsPreview(windowId); void showLibraryMenu(windowId); }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Library" tooltip={preview ? undefined : "Library"} onPress={() => { closeDownloadsPreview(windowId); openInternalPage("downloads", windowId); }}>
          {({ pressed }) => (
            <View style={{ width: controlCell, height: band, alignItems: "center", justifyContent: "center", borderRadius: DOWNLOADS_BUTTON.radius, backgroundColor: glass ? undefined : pressed ? theme.toolbarPressed : lit ? theme.toolbarHover : undefined }}>
              {glass && (lit || pressed) ? <GlassFill radius={DOWNLOADS_BUTTON.radius} state={pressed ? "pressed" : "active"} /> : null}
              <Animated.View pointerEvents="none" style={{ opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [icons.idle, icons.selected] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, reduceMotion() ? 0 : LIBRARY_MOTION.lift] }) }, { scale: pressed && !reduceMotion() ? LIBRARY_MOTION.pressedScale : progress.interpolate({ inputRange: [0, 1], outputRange: [1, reduceMotion() ? 1 : LIBRARY_MOTION.scale] }) }] }}>
                <Image source={LIBRARY_ICON} style={{ width: libraryIcon, height: libraryIcon, tintColor: theme.mark }} />
              </Animated.View>
            </View>
          )}
        </Pressable>
      </ContextMenuArea>
    </View>
  );
}
