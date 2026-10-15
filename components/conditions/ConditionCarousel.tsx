'use client'
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ConditionCard from './ConditionCard';

export interface CarouselCondition {
  name: string;
  slug: string;
  image?: string;
}

const arrow =
  'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#0284C7]/30 bg-white text-[#0284C7] shadow-sm transition hover:bg-[#0284C7] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0284C7]';

/** Horizontal slider: 2 / 3 / 6 cards per view, arrows move one full page at a time. */
export default function ConditionCarousel({ conditions }: { conditions: CarouselCondition[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const page = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth + 16), behavior: 'smooth' });
  };

  return (
    <>
      <div className="mb-10 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-bold text-[#082F49]">Shop by Condition</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous conditions" className={arrow}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => page(1)} disabled={edge.end} aria-label="Next conditions" className={arrow}>
            <ChevronRight size={18} />
          </button>
          <Link
            href="/conditions"
            className="ml-1 flex items-center gap-1 rounded-full bg-[#0284C7] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#075985]"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div
        ref={track}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {conditions.map((c) => (
          <div
            key={c.slug}
            className="shrink-0 snap-start basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-5rem)/6)]"
          >
            <ConditionCard name={c.name} slug={c.slug} image={c.image} />
          </div>
        ))}
      </div>
    </>
  );
}
