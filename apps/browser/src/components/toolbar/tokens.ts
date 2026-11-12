import { duration, spring } from "../ui/motion";

export const GLYPH = 13;

export const TOOLBAR_MOTION = { dim: duration.base, progress: duration.base, hide: duration.base, show: duration.base, settle: 0 } as const;

export const COPY_FEEDBACK = {
  hold: 1000,
  delay: 150,
  hiddenScale: 0.01,
  clipOffset: -10,
  linkSpring: spring({ response: 0.3, damping: 0.6 }),
  checkSpring: spring({ response: 0.5, damping: 0.6 }),
} as const;
