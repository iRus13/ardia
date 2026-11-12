import { useBrowser } from "../browser/store";
import { setDownloadsOpen } from "./actions";
import { noteControlFeedback } from "../telemetry/usage";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function closeDownloadsPreview(windowId: string) {
  const timer = timers.get(windowId);
  if (timer) clearTimeout(timer);
  timers.delete(windowId);
  if (useBrowser.getState().windowUi[windowId]?.downloadsPreview) setDownloadsOpen(windowId, false);
}

export function holdDownloadsPreview(windowId: string, open = false) {
  const timer = timers.get(windowId);
  if (timer) clearTimeout(timer);
  timers.delete(windowId);
  if (open && !useBrowser.getState().windowUi[windowId]?.downloadsOpen) {
    setDownloadsOpen(windowId, true, true);
    if (useBrowser.getState().windowUi[windowId]?.downloadsPreview) noteControlFeedback("downloadsHoverPreviews");
  }
}

export function leaveDownloadsPreview(windowId: string, delay: number) {
  const timer = timers.get(windowId);
  if (timer) clearTimeout(timer);
  timers.set(windowId, setTimeout(() => closeDownloadsPreview(windowId), delay));
}
