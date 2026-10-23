"use client";
import type { RefObject } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

interface Props {
  playing: boolean;
  progressRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onReplay: () => void;
  onSkip: () => void;
  onSeek: (fraction: number) => void;
}

const btn =
  "pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-[#082F49]/70 px-3 text-xs font-semibold text-white backdrop-blur-md border border-white/15 transition hover:bg-[#082F49] focus-visible:outline-2 focus-visible:outline-[#22D3EE]";

export function Controls({ playing, progressRef, onToggle, onReplay, onSkip, onSeek }: Props) {
  return (
    <>
      <div className="absolute right-4 top-20 z-20 flex gap-2 sm:right-8">
        <button type="button" className={btn} onClick={onToggle} aria-label={playing ? "Pause story" : "Play story"}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button type="button" className={btn} onClick={onReplay} aria-label="Replay story">
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Replay</span>
        </button>
        <button type="button" className={btn} onClick={onSkip} aria-label="Skip to the end">
          <SkipForward size={14} />
          Skip
        </button>
      </div>
      <div
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 h-3 cursor-pointer"
        data-story-seek
        aria-hidden
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onSeek((e.clientX - r.left) / r.width);
        }}
      >
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div ref={progressRef} className="h-full origin-left bg-[#22D3EE]" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </>
  );
}

export default Controls;
