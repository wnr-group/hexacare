"use client";
import Link from "next/link";
import { ArrowRight, FileText, HeartHandshake, Pill, Snowflake, Stethoscope, Truck, type LucideIcon } from "lucide-react";
import { storyConfig } from "./story.config";
import type { StoryView } from "./view";

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  pill: Pill,
  "file-text": FileText,
  snowflake: Snowflake,
  truck: Truck,
  "heart-handshake": HeartHandshake,
};

const glass = "bg-[#082F49]/75 text-white backdrop-blur-md border border-white/15 shadow-lg shadow-[#082F49]/30";

/** Real DOM text laid over the canvas: captions, service card, pipeline chips, city chips, counters, CTA. */
export function CaptionLayer({ view }: { view: StoryView }) {
  const svc = view.service >= 0 ? storyConfig.services[view.service] : null;
  const Icon = svc ? (ICONS[svc.icon] ?? Stethoscope) : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-4 pb-28 pt-24 sm:px-8">
      {/* top region: service card / pipeline / cities */}
      <div className="flex flex-col items-center gap-3">
        {svc && Icon && (
          <div key={view.service} className={`story-pop flex max-w-sm items-center gap-4 rounded-2xl px-5 py-4 ${glass}`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#22D3EE]/20 text-[#22D3EE]">
              <Icon size={24} />
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">{svc.title}</span>
              <span className="mt-0.5 block text-sm text-white/80">{svc.line}</span>
            </span>
          </div>
        )}
        {view.station >= 0 && (
          <ol className={`story-pop flex flex-wrap items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold sm:text-sm ${glass}`} aria-label="Medicine journey">
            {storyConfig.pipeline.map((label, i) => (
              <li key={label} className="flex items-center gap-1.5">
                <span className={`rounded-full px-3 py-1 transition-colors duration-300 ${i === view.station ? "bg-[#22D3EE] text-[#082F49]" : i < view.station ? "bg-white/20" : "text-white/60"}`}>
                  {label}
                </span>
                {i < storyConfig.pipeline.length - 1 && <ArrowRight size={14} className="text-white/50" />}
              </li>
            ))}
          </ol>
        )}
        {view.cities > 0 && (
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Branch cities">
            {storyConfig.cities.slice(0, view.cities).map((c) => (
              <li key={c} className={`story-pop rounded-full px-4 py-1.5 text-sm font-semibold ${glass}`}>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#22D3EE]" />
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* bottom region: counters, caption, CTA */}
      <div className="flex flex-col items-center gap-4">
        {view.statP > 0 && (
          <dl className={`story-pop grid w-full max-w-xl grid-cols-3 gap-2 rounded-2xl px-3 py-3 text-center sm:gap-6 sm:px-6 ${glass}`}>
            {storyConfig.stats.map((s) => (
              <div key={s.label}>
                <dd className="text-xl font-extrabold tabular-nums text-[#22D3EE] sm:text-3xl">
                  {s.prefix}
                  {Math.round(s.value * view.statP).toLocaleString("en-IN")}
                  {view.statP >= 1 ? s.suffix : ""}
                </dd>
                <dt className="text-[11px] text-white/80 sm:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        )}
        <p
          key={view.caption ?? "none"}
          aria-live="polite"
          className={`max-w-3xl rounded-2xl px-5 py-3 text-center text-lg font-semibold leading-snug sm:text-2xl md:text-3xl ${view.caption ? "story-fade " + glass : "opacity-0"}`}
        >
          {view.caption ?? " "}
        </p>
        {view.cta && (
          <Link
            href={storyConfig.cta.href}
            className="story-pop pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#22D3EE] px-7 py-3 font-bold text-[#082F49] shadow-lg shadow-[#22D3EE]/40 transition hover:-translate-y-0.5 hover:bg-white"
          >
            {storyConfig.cta.label}
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default CaptionLayer;
