"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type gsap from "gsap";
import { createStoryState, type StoryState } from "./state";
import { storyConfig } from "./story.config";
import { deriveView, initialView, viewKey, type Marks, type StoryView } from "./view";
import CaptionLayer from "./CaptionLayer";
import Controls from "./Controls";
import StoryFallback from "./StoryFallback";

// the 3D scene (three, r3f, drei, postprocessing, models) is only fetched when the section nears the viewport
const Scene = dynamic(() => import("./Scene"), { ssr: false });

type Mode = "pending" | "webgl" | "fallback-motion" | "fallback-gl";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function HexacareStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const marksRef = useRef<Marks | null>(null);
  const [story] = useState<StoryState>(createStoryState);

  const [mode, setMode] = useState<Mode>("pending");
  const [lowPower, setLowPower] = useState(false);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [docVisible, setDocVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [tlReady, setTlReady] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [view, setView] = useState<StoryView>(initialView);
  const viewKeyRef = useRef("");

  // capability checks
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLowPower(mobile);
    setMode(reduced ? "fallback-motion" : hasWebGL() ? "webgl" : "fallback-gl");
  }, []);

  // visibility: lazy-mount near the viewport, play only while on screen and the tab is visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || mode !== "webgl") return;
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "900px" });
    const viewIO = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    nearIO.observe(el);
    viewIO.observe(el);
    const onVis = () => setDocVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      nearIO.disconnect();
      viewIO.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mode]);

  // master timeline
  useEffect(() => {
    if (mode !== "webgl") return;
    let killed = false;
    let tl: gsap.core.Timeline | null = null;
    (async () => {
      const { buildTimeline } = await import("./timeline");
      if (killed) return;
      const built = buildTimeline(story);
      tl = built.tl;
      marksRef.current = built.marks;
      tlRef.current = tl;
      const total = tl.duration();
      const fadeLen = 0.8;
      tl.eventCallback("onUpdate", () => {
        const t = tl!.time();
        story.time = t;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(1, t / total)})`;
        if (veilRef.current) {
          const out = storyConfig.loop ? Math.max(0, (t - (total - fadeLen)) / fadeLen) : 0;
          const inn = Math.max(0, 1 - t / 0.5);
          veilRef.current.style.opacity = String(Math.min(1, Math.max(out, inn)));
        }
        const v = deriveView(t, marksRef.current!);
        const key = viewKey(v);
        if (key !== viewKeyRef.current) {
          viewKeyRef.current = key;
          setView(v);
        }
      });
      setTlReady(true);
    })();
    return () => {
      killed = true;
      tl?.kill();
      tlRef.current = null;
      setTlReady(false);
    };
  }, [mode, story]);

  const active = inView && docVisible;
  const shouldPlay = tlReady && ready && active && !userPaused;
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (shouldPlay) {
      if (!tl.isActive() && tl.progress() >= 1) tl.restart();
      else tl.play();
    } else tl.pause();
  }, [shouldPlay, tlReady]);

  const onReady = useCallback(() => setReady(true), []);
  const onToggle = () => setUserPaused((p) => !p);
  const onReplay = () => {
    tlRef.current?.restart();
    setUserPaused(false);
  };
  const onSkip = () => {
    const m = marksRef.current;
    if (m) tlRef.current?.seek(m.finaleStart + 1.4, false);
  };
  const onSeek = (f: number) => {
    const tl = tlRef.current;
    if (tl) tl.seek(Math.min(0.999, Math.max(0, f)) * tl.duration(), false);
  };

  if (mode === "fallback-motion") return <StoryFallback reason="reduced-motion" />;
  if (mode === "fallback-gl") return <StoryFallback reason="no-webgl" />;

  return (
    <section
      ref={sectionRef}
      aria-label="The Hexacare story"
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-[#04121F] text-white"
    >
      {near && mode === "webgl" && (
        <Scene story={story} active={active} lowPower={lowPower} onReady={onReady} />
      )}

      {/* loading poster until the first frame is ready */}
      <div className={`absolute inset-0 z-30 transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <StoryFallback reason="loading" />
      </div>

      {/* soft fade for the loop restart / start */}
      <div ref={veilRef} className="pointer-events-none absolute inset-0 z-[15] bg-[#04121F] opacity-0" />

      <CaptionLayer view={view} />
      <Controls playing={!userPaused} progressRef={progressRef} onToggle={onToggle} onReplay={onReplay} onSkip={onSkip} onSeek={onSeek} />
    </section>
  );
}
