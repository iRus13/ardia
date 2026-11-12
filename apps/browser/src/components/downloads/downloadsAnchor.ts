import { useEffect, useRef } from "react";
import { View } from "react-native";
import { anchorInside, type Rect } from "./downloadsPlacement";

type AnchorKind = "downloads" | "library";
const anchors = new Map<string, Map<View, AnchorKind>>();

export function useDownloadsAnchor(windowId: string, kind: AnchorKind) {
  const view = useRef<View>(null);
  useEffect(() => {
    const node = view.current;
    if (!node) return;
    const set = anchors.get(windowId) ?? new Map<View, AnchorKind>();
    anchors.set(windowId, set);
    set.set(node, kind);
    return () => {
      set.delete(node);
      if (!set.size && anchors.get(windowId) === set) anchors.delete(windowId);
    };
  }, [windowId, kind]);
  return view;
}

export function measureInWindow(view: View): Promise<Rect | null> {
  return new Promise((resolve) => view.measureInWindow((x, y, width, height) => resolve(width > 0 && height > 0 ? { x, y, width, height } : null)));
}

export async function locateDownloadsButton(windowId: string, origin: Rect, preferred?: AnchorKind): Promise<Rect | null> {
  const candidates = [...(anchors.get(windowId) ?? [])].filter(([, kind]) => !preferred || kind === preferred);
  const rects = await Promise.all(candidates.map(([view]) => measureInWindow(view)));
  for (const rect of rects) {
    const local = rect && { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height };
    if (anchorInside(origin, local)) return local;
  }
  return null;
}
