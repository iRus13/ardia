import { Pressable, View } from "react-native";
import { runCommand } from "../../state/commands/commands";
import { showMenu } from "../../state/app/system";
import { Symbol, useTheme } from "../ui";
import { profileSwitcher } from "./tokens";

async function openLibrary(windowId: string) {
  const choice = await showMenu([
    { id: "manageBookmarks", title: "Bookmarks", symbol: "book.fill" },
    { id: "showHistory", title: "History", symbol: "clock.arrow.circlepath" },
    { id: "downloads", title: "Downloads", symbol: "arrow.down.circle" },
  ]);
  if (choice === "manageBookmarks" || choice === "showHistory" || choice === "downloads") runCommand({ command: choice, arg: null, windowId });
}

export function LibraryButton({ windowId }: { windowId: string }) {
  const theme = useTheme();
  const { controlCell, band, libraryIcon, librarySparkle, icons } = profileSwitcher;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Library" tooltip="Library" onPress={() => void openLibrary(windowId)}>
      <View style={{ width: controlCell, height: band, alignItems: "center", justifyContent: "center", opacity: icons.idle }}>
        <Symbol name="archivebox.fill" size={libraryIcon} color={theme.mark} style={{ width: controlCell, height: band }} />
        <Symbol name="sparkles" size={librarySparkle} color={theme.mark} style={{ position: "absolute", top: 0, left: 0, width: librarySparkle, height: librarySparkle }} />
      </View>
    </Pressable>
  );
}
