import Link from "next/link";
import { storyConfig } from "./story.config";

/** Static 2D version of the story: used for prefers-reduced-motion and when WebGL is unavailable. */
export function StoryFallback({ reason }: { reason: "reduced-motion" | "no-webgl" | "loading" }) {
  return (
    <section
      aria-label="The Hexacare story"
      className={`relative flex ${reason === "loading" ? "h-full" : "min-h-[100svh]"} w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#082F49] to-[#0B4F7D] px-6 py-24 text-center text-white`}
      data-story-fallback={reason}
    >
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_20%,#22D3EE_0,transparent_40%),radial-gradient(circle_at_80%_80%,#0284C7_0,transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={storyConfig.brand.logo} alt="Hexacare" width={96} height={96} className="h-24 w-24" />
        <h2 className="text-3xl font-extrabold sm:text-5xl">{storyConfig.tagline}</h2>
        <p className="max-w-2xl text-lg text-white/80">
          When illness makes everyday life hard, Hexacare is here to help — from expert guidance to careful delivery at your door.
        </p>
        <div className="flex items-end justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero_male_doctor.png" alt="" className="h-56 object-contain sm:h-72" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero_female_doctor.png" alt="" className="h-56 object-contain sm:h-72" />
        </div>
        <ul className="grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
          {storyConfig.services.map((s) => (
            <li key={s.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur">
              <p className="font-bold">{s.title}</p>
              <p className="text-sm text-white/75">{s.line}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-white/70">{storyConfig.cities.join(" · ")}</p>
        {reason !== "loading" && (
          <Link href={storyConfig.cta.href} className="rounded-full bg-[#22D3EE] px-7 py-3 font-bold text-[#082F49]">
            {storyConfig.cta.label}
          </Link>
        )}
      </div>
    </section>
  );
}

export default StoryFallback;
