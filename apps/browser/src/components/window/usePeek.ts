import { useEffect, useRef, useState } from "react";
import { Animated, AppState } from "react-native";
import { easeOutCubic } from "./dockMotion";
import { curve, duration } from "../ui/motion";
import { SIDEBAR_PEEK_MOTION } from "./tokens";
import { reduceMotion } from "../ui/reduceMotion";
import { backgroundInstance } from "../../state/app/appSettings";

const SLIDE_MS = duration.base;
const HIDE_DELAY_MS = 120;
const appInFront = () => backgroundInstance || AppState.currentState === "active";

export function usePeek(
  enabled: boolean,
  fast = false,
  held: () => boolean = () => false,
  onSlideOut: () => void = () => {},
  onOpen: (bounce: boolean) => void = () => {},
) {
  const slide = useRef(new Animated.Value(0)).current;
  const [live, setLive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heldBack = useRef(false);
  const out = useRef(false);
  const waitingForFocus = useRef(false);
  const animate = (to: number, done?: () => void) => {
    if (reduceMotion()) {
      slide.stopAnimation();
      slide.setValue(to);
      done?.();
      return;
    }
    Animated.timing(slide, {
      toValue: to,
      duration: fast ? SIDEBAR_PEEK_MOTION.duration : SLIDE_MS,
      easing: fast ? easeOutCubic : curve.enter,
      useNativeDriver: true,
    }).start(({ finished }) => finished && done?.());
  };
  const slideOut = () => {
    out.current = false;
    setLeaving(true);
    onSlideOut();
    animate(0, () => {
      setLive(false);
      setLeaving(false);
    });
  };
  const show = () => {
    clearTimeout(hideTimer.current);
    heldBack.current = false;
    if (!enabled) return;
    if (!out.current && !appInFront()) {
      waitingForFocus.current = true;
      return;
    }
    waitingForFocus.current = false;
    if (out.current) return;
    onOpen(live);
    out.current = true;
    setLeaving(false);
    setLive(true);
    animate(1);
  };
  const cancelPending = (pointerStillAtEdge = false) => {
    waitingForFocus.current &&= pointerStillAtEdge;
  };
  const hide = () => {
    clearTimeout(hideTimer.current);
    if (!out.current) return cancelPending();
    const finish = () => {
      heldBack.current = held();
      if (!heldBack.current) slideOut();
    };
    if (fast) finish();
    else hideTimer.current = setTimeout(finish, HIDE_DELAY_MS);
  };
  const recheck = () => {
    if (!heldBack.current || held()) return;
    heldBack.current = false;
    hide();
  };
  const latestShow = useRef(show);
  latestShow.current = show;
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => state === "active" && waitingForFocus.current && latestShow.current());
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (enabled) return;
    waitingForFocus.current = false;
    clearTimeout(hideTimer.current);
    if (live) slideOut();
  }, [enabled]);
  useEffect(() => () => clearTimeout(hideTimer.current), []);
  return { slide, live, leaving, show, hide, recheck, cancelPending };
}
