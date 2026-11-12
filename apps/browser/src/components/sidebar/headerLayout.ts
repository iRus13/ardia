const LIGHTS_CENTER = 24;
const FIELD_TOP = 46;
export const SIDEBAR_FIELD_HEIGHT = 36;
const WINDOWED_NAVIGATION_OFFSET = 32;

export function sidebarHeaderLayout(fullscreen: boolean, peeking = false) {
  const offset = fullscreen || peeking ? 0 : WINDOWED_NAVIGATION_OFFSET;
  return {
    navigationCenter: LIGHTS_CENTER + offset,
    toggleCenter: 29,
    fieldTop: FIELD_TOP + offset,
    height: FIELD_TOP + offset + SIDEBAR_FIELD_HEIGHT,
  };
}
