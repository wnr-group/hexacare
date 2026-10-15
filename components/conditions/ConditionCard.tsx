'use client'
import { createElement, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { conditionIcon } from './conditionIcons';

/** Square card with a photo from /public/conditions; falls back to a gradient + icon when there is none. */
export default function ConditionCard({ name, slug, image }: { name: string; slug: string; image?: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={`/conditions/${slug}`}
      className="group relative block aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#082F49] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/20"
    >
      {failed || !image ? (
        <span className="absolute inset-0 flex items-center justify-center text-white/15">
          {createElement(conditionIcon(name), { size: 96, strokeWidth: 1.25 })}
        </span>
      ) : (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
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
