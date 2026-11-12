import { useMemo } from "react";
import { markHoverProps } from "../../lib/hoverMarks";
import { holdDownloadsPreview, leaveDownloadsPreview } from "../../state/windows/downloadsPreview";
import { DOWNLOADS_PREVIEW } from "./tokens";

export function useDownloadsPreview(windowId: string, openOnEnter = false) {
  return useMemo(() => markHoverProps({
    onMouseEnter: () => holdDownloadsPreview(windowId, openOnEnter),
    onMouseLeave: () => leaveDownloadsPreview(windowId, DOWNLOADS_PREVIEW.leaveDelay),
  }), [windowId, openOnEnter]);
}
