import { PixelRatio, Text } from "react-native";
import { Dot, hairline, ink, weight } from "../ui";
import { profileAccent } from "../ui/theme";
import type { Profile } from "../../state/browser/types";
import { profileBadge, profileColors, profileSwitcher } from "./tokens";
import { iconSymbol } from "../../lib/customIcon";
import { ProfileSymbol } from "./ProfileSymbol";

export const PROFILE_SYMBOLS: { name: string; title: string }[] = [
  { name: "star.fill", title: "Star" },
  { name: "bookmark.fill", title: "Bookmark" },
  { name: "heart.fill", title: "Heart" },
  { name: "flag.fill", title: "Flag" },
  { name: "bolt.fill", title: "Bolt" },
  { name: "triangle.fill", title: "Triangle" },
  { name: "asterisk", title: "Asterisk" },
  { name: "bell.fill", title: "Bell" },
  { name: "lightbulb.fill", title: "Lightbulb" },
  { name: "drop.triangle.fill", title: "Droplet triangle" },
  { name: "square.grid.2x2.fill", title: "Grid" },
  { name: "circle.grid.3x3.fill", title: "Dots" },
  { name: "square.3.layers.3d", title: "Layers" },
  { name: "cylinder.split.1x2.fill", title: "Database" },
  { name: "rectangle.stack.fill", title: "Stack" },
  { name: "square.on.square.fill", title: "Squares" },
  { name: "folder.fill", title: "Folder" },
  { name: "tray.fill", title: "Tray" },
  { name: "calendar", title: "Calendar" },
  { name: "envelope.fill", title: "Mail" },
  { name: "checkmark.square.fill", title: "Checklist" },
  { name: "doc.fill", title: "Document" },
  { name: "book.fill", title: "Book" },
  { name: "ellipsis.message.fill", title: "Message" },
  { name: "person.2.fill", title: "People" },
  { name: "terminal.fill", title: "Terminal" },
  { name: "wrench.and.screwdriver.fill", title: "Tools" },
  { name: "square.fill", title: "Square" },
  { name: "drop.fill", title: "Drop" },
  { name: "circle.fill", title: "Circle" },
  { name: "moon.fill", title: "Moon" },
  { name: "sun.max.fill", title: "Sun" },
  { name: "saturn", title: "Saturn" },
  { name: "leaf.fill", title: "Leaf" },
  { name: "cloud.fill", title: "Cloud" },
  { name: "pawprint.fill", title: "Paw" },
  { name: "basket.fill", title: "Basket" },
  { name: "gift.fill", title: "Gift" },
  { name: "bed.double.fill", title: "Bed" },
  { name: "fork.knife", title: "Food" },
  { name: "dumbbell.fill", title: "Fitness" },
  { name: "airplane", title: "Travel" },
  { name: "music.note", title: "Music" },
  { name: "paintpalette.fill", title: "Art" },
  { name: "video.fill", title: "Video" },
  { name: "bandage.fill", title: "Health" },
  { name: "chevron.left.forwardslash.chevron.right", title: "Code" },
  { name: "globe.americas.fill", title: "Globe" },
  { name: "cloud", title: "Cloud outline" },
  { name: "map.fill", title: "Map" },
  { name: "campfire.fill", title: "Campfire" },
  { name: "pizza.fill", title: "Pizza" },
  { name: "skull.fill", title: "Skull" },
  { name: "scroll.fill", title: "Scroll" },
  { name: "hand.thumbsup.fill", title: "Thumbs up" },
  { name: "tram.fill", title: "Tram" },
];

export const switcherCellWidth = (icon: string | null) => (icon ? profileSwitcher.iconCell : profileSwitcher.dotCell);

export function switcherIcons(icons: (string | null)[], shown: boolean, room: number): (string | null)[] {
  const fits = icons.length * profileSwitcher.minIconCell <= room;
  return shown && fits ? icons : icons.map(() => null);
}

export function SwitcherMark({ icon, color, scale = 1 }: { icon: string | null; color: string; scale?: number }) {
  const { iconCell, icon: size, dot } = profileSwitcher;
  const symbol = iconSymbol(icon);
  if (symbol) return <ProfileSymbol name={symbol} size={size * scale} color={color} style={{ width: iconCell * scale, height: iconCell * scale }} />;
  if (icon)
    return (
      <Text numberOfLines={1} style={{ width: iconCell * scale, fontSize: size * scale, lineHeight: iconCell * scale, textAlign: "center", color }}>
        {icon}
      </Text>
    );
  return <Dot size={dot * scale} color={color} />;
}

const BADGE_EDGE_MIN = 22;

export function ProfileBadge({ profile, size = 26 }: { profile: Pick<Profile, "name" | "color" | "icon"> & Partial<Pick<Profile, "theme">>; size?: number }) {
  const swatch = profileAccent(profile);
  const symbol = iconSymbol(profile.icon);
  const nudge = PixelRatio.roundToNearestPixel(size * profileBadge.nudge);
  return (
    <Dot size={size} color={swatch} ring={size >= BADGE_EDGE_MIN ? profileColors.badgeEdge : undefined} ringWidth={hairline.ring}>
      {symbol ? (
        <ProfileSymbol name={symbol} size={size * 0.5} color={ink.white} style={{ width: size, height: size }} />
      ) : (
        <Text
          numberOfLines={1}
          style={{
            width: size,
            textAlign: "center",
            fontSize: profile.icon ? size * 0.55 : size * profileBadge.initialScale,
            letterSpacing: profile.icon ? 0 : size * profileBadge.initialTracking,
            fontWeight: weight.semibold,
            color: ink.white,
            transform: [{ translateX: profile.icon ? nudge : 0 }, { translateY: nudge }],
          }}
        >
          {profile.icon ?? (profile.name.trim()[0] ?? "?").toUpperCase()}
        </Text>
      )}
    </Dot>
  );
}
