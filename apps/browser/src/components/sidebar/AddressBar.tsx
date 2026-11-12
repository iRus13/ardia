import { useRef } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import { useShortcutHint, withShortcut } from "../../state/commands/commandShortcuts";
import { layout, useTheme } from "../ui/theme";
import { useActiveTabId, useSettings, useSidebarSide, useTabLive, useWindowId } from "../../state/browser/hooks";
import { toggleSidebar } from "../../state/windows/actions";
import { openEmptySidebarField } from "../../state/omnibox/barState";
import { isAddressBarInSidebar } from "../../state/sidebar/current";
import { usePageProgress } from "../../state/tabs/pageProgress";
import { useHistoryAvailability } from "../../state/tabs/navigation";
import { toolbarPalette, type ToolbarPalette } from "../ui/toolbarColors";
import { Button, type ButtonHit, FadeLabel, font, radius, space, ToolbarRowContext, useHover } from "../ui";
import { TOOLBAR_ROWS } from "../../lib/toolbarRow";
import { setUrlAnchor } from "../../state/windows/layout";
import { SIDEBAR_FIELD } from "./geometry";
import { SidebarFieldFill } from "./SidebarField";
import { SidebarUrlField, useToolbarTab } from "../toolbar/Toolbar";
import { HistoryButton, ReloadButton } from "../toolbar/NavButtons";
import { GLYPH } from "../toolbar/tokens";
import { HEADER_TOOLS, navButtonsFitting, type HeaderButton } from "../window/dockMotion";
import { useSidebarHeaderLayout } from "./useSidebarHeaderLayout";

const BUTTON = layout.toolbarButton;
const { edge: EDGE } = HEADER_TOOLS;
const PLATE = 32;
const PLATE_RADIUS = radius.toolbar;

export function SidebarHeaderTools({ width }: { width: number }) {
  const windowId = useWindowId();
  const tab = useToolbarTab(useActiveTabId());
  const palette = toolbarPalette(useTheme(), null);
  const toggle = useSettings((st) => st.showSidebarButton !== false);
  const right = useSidebarSide(windowId) === "right";
  const sidebarHint = useShortcutHint("toggleSidebar");
  const header = useSidebarHeaderLayout(windowId);
  const toggleX = header.toggleCenter;
  const { buttons, step } = navButtonsFitting(width, BUTTON, toggle, toggleX);
  const shown = tab ? buttons : [];
  const last = width - EDGE - BUTTON / 2;
  const centres = shown.map((_, i) => last - (shown.length - 1 - i) * step);
  const at = toggle ? [toggleX, ...centres] : centres;
  const plate = Math.min(PLATE, step);
  const place = (center: number) => ({
    style: { position: "absolute" as const, top: header.navigationCenter - plate / 2, left: center - plate / 2 },
    hit: { width: plate, height: plate, plateX: 0, plateY: 0, box: plate, radius: PLATE_RADIUS },
  });
  return (
    <>
      {toggle && (
        <Button variant="icon" toolbar
          {...place(at[0]!)}
          palette={palette}
          icon={right ? "sidebar.right" : "sidebar.left"}
          glyph={GLYPH}
          onPress={() => toggleSidebar(windowId)}
          tooltip={withShortcut("Hide Tabs", sidebarHint)}
        />
      )}
      {tab ? <NavigationButtons tab={tab} palette={palette} buttons={shown} slots={at.slice(toggle ? 1 : 0).map(place)} /> : null}
    </>
  );
}

const alreadyFocused = () => {};

function NavigationButtons({
  tab,
  palette,
  buttons,
  slots,
}: {
  tab: NonNullable<ReturnType<typeof useToolbarTab>>;
  palette: ToolbarPalette;
  buttons: HeaderButton[];
  slots: { style: ViewStyle; hit: ButtonHit }[];
}) {
  const loading = useTabLive(tab.id, (l) => l.isLoading);
  const history = useHistoryAvailability(tab.id);
  return (
    <>
      {buttons.map((b, i) =>
        b === "reload" ? (
          <ReloadButton key={b} place={slots[i]} tab={tab} loading={loading} palette={palette} onFocus={alreadyFocused} />
        ) : (
          <HistoryButton
            key={b}
            place={slots[i]}
            tabId={tab.id}
            windowId={tab.windowId}
            direction={b === "back" ? -1 : 1}
            disabled={b === "back" ? !history.back : !history.forward}
            palette={palette}
            onFocus={alreadyFocused}
          />
        ),
      )}
    </>
  );
}

export function SidebarAddressRow() {
  const windowId = useWindowId();
  const tab = useToolbarTab(useActiveTabId());
  const field = useRef<View>(null);
  const header = useSidebarHeaderLayout(windowId);
  const anchor = () =>
    field.current?.measureInWindow((x, y, width, height) => {
      if (width && isAddressBarInSidebar(windowId)) setUrlAnchor(windowId, { left: x, top: y, width, sidebar: { height } });
    });

  return (
    <View
      ref={field}
      onLayout={anchor}
      style={{ position: "absolute", left: layout.sidebarInset, right: layout.sidebarInset, top: header.fieldTop, height: SIDEBAR_FIELD.height }}
    >
      <ToolbarRowContext.Provider value={TOOLBAR_ROWS.regular}>
        {tab?.url ? <PageField tab={tab} windowId={windowId} /> : <EmptyField windowId={windowId} />}
      </ToolbarRowContext.Provider>
    </View>
  );
}

function PageField({ tab, windowId }: { tab: NonNullable<ReturnType<typeof useToolbarTab>>; windowId: string }) {
  const palette = toolbarPalette(useTheme(), null);
  const loading = useTabLive(tab.id, (l) => l.isLoading);
  const loaded = usePageProgress(tab.id);
  const progress = loading ? loaded : null;
  return (
    <SidebarUrlField
      tab={tab}
      palette={palette}
      windowId={windowId}
      onFocus={alreadyFocused}
      height={SIDEBAR_FIELD.height}
      progress={progress}
    />
  );
}

function EmptyField({ windowId }: { windowId: string }) {
  const theme = useTheme();
  const { hovered, hoverProps } = useHover();
  const open = () => openEmptySidebarField(windowId);
  return (
    <View {...hoverProps}>
      <Pressable onPress={open}>
        <View style={{ height: SIDEBAR_FIELD.height, justifyContent: "center", paddingLeft: space.l }}>
          <SidebarFieldFill hovered={hovered} />
          <FadeLabel text="Search or enter address" fontSize={font.body.fontSize} color={theme.placeholder} fadeWidth={14} style={{ height: 18, marginLeft: -space.xxs }} />
        </View>
      </Pressable>
    </View>
  );
}
