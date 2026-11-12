import { profileSwitcher } from "./tokens";

export function switcherCellSpan(room: number, profiles: number): number {
  return Math.max(0, Math.min(profileSwitcher.maxCell, room / Math.max(1, profiles)));
}
