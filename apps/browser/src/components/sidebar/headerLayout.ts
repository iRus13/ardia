const LIGHTS_CENTER = 24;
const FIELD_TOP = 46;
export const SIDEBAR_FIELD_HEIGHT = 36;
const WINDOWED_TOGGLE_CENTER = 89;

export function sidebarHeaderLayout(fullscreen: boolean, peeking = false) {
  return {
    navigationCenter: LIGHTS_CENTER,
    toggleCenter: fullscreen || peeking ? 29 : WINDOWED_TOGGLE_CENTER,
    fieldTop: FIELD_TOP,
    height: FIELD_TOP + SIDEBAR_FIELD_HEIGHT,
  };
}
