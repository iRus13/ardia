import { useWindowFullScreen } from "../../state/browser/hooks";
import { useDockMotion } from "../../state/windows/dockMotion";
import { sidebarHeaderLayout } from "./headerLayout";

export function useSidebarHeaderLayout(windowId: string) {
  const fullscreen = useWindowFullScreen(windowId);
  const peeking = useDockMotion((state) => !!state.peeks[windowId]);
  return sidebarHeaderLayout(fullscreen, peeking);
}
