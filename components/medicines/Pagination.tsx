import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ current, pages, href }: { current: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  const shown = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - current) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {current > 1 && (
        <Link href={href(current - 1)} aria-label="Previous page" className="rounded-lg border border-sky-200 bg-white p-2 text-[#0284C7] hover:bg-[#EAF6FF]">
          <ChevronLeft size={18} />
        </Link>
      )}
      {shown.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - shown[i - 1] > 1 && <span className="text-slate-400">…</span>}
          <Link
            href={href(n)}
            aria-current={n === current ? "page" : undefined}
            className={`min-w-9 rounded-lg border px-3 py-1.5 text-center text-sm font-semibold ${n === current ? "border-[#0284C7] bg-[#0284C7] text-white" : "border-sky-200 bg-white text-[#4B6584] hover:bg-[#EAF6FF]"}`}
          >
            {n}
          </Link>
        </span>
      ))}
      {current < pages && (
        <Link href={href(current + 1)} aria-label="Next page" className="rounded-lg border border-sky-200 bg-white p-2 text-[#0284C7] hover:bg-[#EAF6FF]">
          <ChevronRight size={18} />
        </Link>
      )}
    </nav>
  );
}
