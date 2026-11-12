import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import type { Tab } from "../../state/browser/types";
import { useShortcutHint, withShortcut } from "../../state/commands/commandShortcuts";
import { copyPageUrl } from "../../state/site/selection";
import { noteControlFeedback } from "../../state/telemetry/usage";
import { Button, Symbol } from "../ui";
import { reduceMotion } from "../ui/reduceMotion";
import type { ToolbarPalette } from "../ui/toolbarColors";
import { useToolbarRowContext } from "../ui/toolbarRowContext";
import { COPY_FEEDBACK, GLYPH } from "./tokens";

export function CopyUrlButton({ tab, palette }: { tab: Pick<Tab, "id" | "url">; palette: ToolbarPalette; windowId?: string }) {
  const hint = useShortcutHint("copyUrl");
  const row = useToolbarRowContext();
  const [copied, setCopied] = useState(false);
  const link = useRef(new Animated.Value(0)).current;
  const check = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setCopied(false);
    link.stopAnimation();
    check.stopAnimation();
    link.setValue(0);
    check.setValue(0);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      link.stopAnimation();
      check.stopAnimation();
    };
  }, [tab.id, tab.url, link, check]);
  useEffect(() => {
    if (reduceMotion()) {
      link.setValue(copied ? 1 : 0);
      check.setValue(copied ? 1 : 0);
      return;
    }
    const animation = Animated.parallel([
      Animated.spring(link, { toValue: copied ? 1 : 0, ...COPY_FEEDBACK.linkSpring, delay: copied ? 0 : COPY_FEEDBACK.delay, useNativeDriver: true }),
      Animated.spring(check, { toValue: copied ? 1 : 0, ...COPY_FEEDBACK.checkSpring, delay: COPY_FEEDBACK.delay, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [copied, link, check]);
  const copy = () => {
    if (!tab.url) return;
    void copyPageUrl(tab.id);
    noteControlFeedback("copyUrlFeedbacks");
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setCopied(false);
    }, COPY_FEEDBACK.hold);
  };
  const frame = { width: row.fieldButton, height: row.fieldButton };
  const clipY = check.interpolate({ inputRange: [0, 1], outputRange: [COPY_FEEDBACK.clipOffset, 0] });
  const imageY = check.interpolate({ inputRange: [0, 1], outputRange: [-COPY_FEEDBACK.clipOffset, 0] });
  return (
    <Button variant="icon" toolbar palette={palette} look="field" onPress={copy} tooltip={copied ? "Copied URL" : withShortcut("Copy URL", hint)}>
      <View pointerEvents="none" style={frame}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: link.interpolate({ inputRange: [0, 1], outputRange: [1, 0], extrapolate: "clamp" }), transform: [{ scale: link.interpolate({ inputRange: [0, 1], outputRange: [1, COPY_FEEDBACK.hiddenScale], extrapolate: "clamp" }) }] }]}>
          <Symbol name="link" size={GLYPH} color={palette.icon} style={frame} />
        </Animated.View>
        <Animated.View style={{ position: "absolute", left: (row.fieldButton - GLYPH) / 2, top: (row.fieldButton - GLYPH) / 2, width: GLYPH, height: GLYPH, overflow: "hidden", opacity: check.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: "clamp" }), transform: [{ translateY: clipY }] }}>
          <Animated.View style={{ transform: [{ translateY: imageY }] }}>
            <Symbol name="checkmark" size={GLYPH} weight="semibold" color={palette.icon} style={{ width: GLYPH, height: GLYPH }} />
          </Animated.View>
        </Animated.View>
      </View>
    </Button>
  );
}
