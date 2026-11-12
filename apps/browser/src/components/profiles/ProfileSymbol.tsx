import { Image, View, type StyleProp, type ViewStyle } from "react-native";
import { Symbol } from "../ui";
import { profileSymbolImages } from "./profileSymbolImages";

export function ProfileSymbol({ name, size, color, style }: { name: string; size: number; color: string; style?: StyleProp<ViewStyle> }) {
  const source = profileSymbolImages[name];
  if (!source) return <Symbol name={name} size={size} weight="semibold" color={color} style={style} />;
  return (
    <View pointerEvents="none" style={[{ alignItems: "center", justifyContent: "center" }, style]}>
      <Image source={source} resizeMode="contain" style={{ width: size, height: size, tintColor: color }} />
    </View>
  );
}
