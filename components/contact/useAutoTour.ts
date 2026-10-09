'use client'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

interface Options {
  /** Branch ids in the order they should be toured (already filtered by the city tab). */
  ids: string[];
  /** The currently selected branch, or null. The tour always continues from here. */
  active: string | null;
  /** Map is initialised and safe to move. */
  ready: boolean;
  /** Called when the tour wants to show the next branch. Must NOT call `interrupt`. */
  onStep: (id: string) => void;
  stepMs?: number;
  idleMs?: number;
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Guided tour over a list of ids.
 *
 * running = ready && switched on && not interrupted && not hovered && in view && tab visible && 2+ ids
 *
 * - While `running`, one timer waits `stepMs`, then calls `onStep(next)`. Selecting a branch
 *   (by the tour or by the visitor) changes `active`, which re-arms the timer, so there is
 *   never more than one timer and the tour always continues from the last selected branch.
 * - `interrupt()` is called on every manual interaction: it stops the tour immediately and
 *   (re)starts a single idle timer; after `idleMs` without further interaction the tour resumes.
 * - Starts switched off when the visitor prefers reduced motion.
 */
export function useAutoTour({ ids, active, ready, onStep, stepMs = 5000, idleMs = 10000 }: Options) {
  const prefersReduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => true // server / hydration: assume reduced so the first paint is "Off"
  );
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const enabled = userChoice ?? !prefersReduced;

  const [interrupted, setInterrupted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  });

  const clearIdle = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = null;
  }, []);

  /** Manual control always wins: stop now, resume after `idleMs` of no interaction. */
  const interrupt = useCallback(() => {
    setInterrupted(true);
    clearIdle();
    idleTimer.current = setTimeout(() => {
      idleTimer.current = null;
      setInterrupted(false);
    }, idleMs);
  }, [idleMs, clearIdle]);

  const toggle = useCallback(() => {
    clearIdle();
    setInterrupted(false);
    setUserChoice(!enabled);
  }, [enabled, clearIdle]);

  /* Page Visibility: pause while the browser tab is hidden. */
  useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  /* Never leave an idle timer behind. */
  useEffect(() => clearIdle, [clearIdle]);

  const idsKey = ids.join("|");
  const running = ready && enabled && !interrupted && !hovering && inView && !hidden && ids.length > 1;

  useEffect(() => {
    if (!running) return;
    const idx = active ? ids.indexOf(active) : -1;
    // Nothing selected yet → start with the first branch after a short beat.
    const delay = idx === -1 ? 1200 : stepMs;
    const t = setTimeout(() => onStepRef.current(ids[(idx + 1) % ids.length]), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, active, idsKey, stepMs]);

  return { enabled, running, toggle, interrupt, setHovering, setInView, stepMs };
}
