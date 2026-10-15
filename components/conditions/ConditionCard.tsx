'use client'
import { createElement, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { conditionIcon } from './conditionIcons';

/** Square card with a photo from /public/conditions/<slug>.jpg; falls back to a gradient + icon. */
export default function ConditionCard({ name, slug }: { name: string; slug: string }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <Link
      href={`/conditions/${slug}`}
      className="group relative block aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#082F49] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/20"
    >
      {failed ? (
        <span className="absolute inset-0 flex items-center justify-center text-white/15">
          {createElement(conditionIcon(name), { size: 96, strokeWidth: 1.25 })}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          src={`/conditions/${slug}.jpg`}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-[#031A2B]/90 via-[#031A2B]/25 to-transparent" />
      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
        <ArrowUpRight size={16} />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4 text-base font-bold leading-snug text-white sm:text-lg">{name}</span>
    </Link>
  );
}
