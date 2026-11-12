import { useEffect, useMemo, useRef, useState } from "react";
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
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const lit = hovered || preview;
  useEffect(() => {
    if (reduceMotion()) {
      progress.setValue(lit ? 1 : 0);
      return;
    }
    const animation = Animated.spring(progress, { toValue: lit ? 1 : 0, ...LIBRARY_MOTION.hoverSpring, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [lit, progress]);
  useEffect(() => {
    const toValue = pressed ? LIBRARY_MOTION.pressedScale : 1;
    if (reduceMotion()) {
      scale.setValue(toValue);
      return;
    }
    const animation = Animated.spring(scale, { toValue, ...LIBRARY_MOTION.pressSpring, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [pressed, scale]);
  useEffect(() => () => closeDownloadsPreview(windowId), [windowId]);
  const { controlCell, band, libraryIcon, icons } = profileSwitcher;
  return (
    <View ref={anchor} collapsable={false} {...hover}>
      <ContextMenuArea onContextMenu={() => { closeDownloadsPreview(windowId); void showLibraryMenu(windowId); }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Library" tooltip={preview ? undefined : "Library"} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)} onPress={() => { closeDownloadsPreview(windowId); openInternalPage("downloads", windowId); }}>
          {({ pressed: down }) => (
            <View style={{ width: controlCell, height: band, alignItems: "center", justifyContent: "center", borderRadius: DOWNLOADS_BUTTON.radius, backgroundColor: glass ? undefined : down ? theme.toolbarPressed : lit ? theme.toolbarHover : undefined }}>
              {glass && (lit || down) ? <GlassFill radius={DOWNLOADS_BUTTON.radius} state={down ? "pressed" : "active"} /> : null}
              <Animated.View pointerEvents="none" style={{ opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [icons.idle, icons.selected] }), transform: [{ scale }] }}>
                <Image source={LIBRARY_ICON} style={{ width: libraryIcon, height: libraryIcon, tintColor: theme.mark }} />
              </Animated.View>
            </View>
          )}
        </Pressable>
      </ContextMenuArea>
    </View>
  );
}
