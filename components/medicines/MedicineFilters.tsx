'use client'
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';

interface Values { q: string; form: string; speciality: string; condition: string; sort: string; stock: boolean }

const field =
  "w-full rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 text-sm text-[#082F49] outline-none transition focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20";

export default function MedicineFilters({
  initial,
  forms,
  specialities,
}: {
  initial: Values;
  forms: { value: string; label: string }[];
  specialities: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [v, setV] = useState<Values>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const go = (next: Values) => {
    clearTimeout(timer.current);
    const p = new URLSearchParams();
    if (next.q.trim()) p.set('q', next.q.trim());
    if (next.form) p.set('form', next.form);
    if (next.speciality) p.set('speciality', next.speciality);
    if (next.condition) p.set('condition', next.condition);
    if (next.sort) p.set('sort', next.sort);
    if (next.stock) p.set('stock', 'in');
    const s = p.toString();
    startTransition(() => router.replace(s ? `/medicines?${s}` : '/medicines', { scroll: false }));
  };

  const update = (patch: Partial<Values>, debounce = false) => {
    const next = { ...v, ...patch };
    setV(next);
    if (debounce) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => go(next), 350);
    } else go(next);
  };

  const dirty = v.q || v.form || v.speciality || v.condition || v.stock;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); go(v); }}
      className="mt-8 grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center"
    >
      <label className="relative block sm:col-span-2 lg:col-span-1">
        <span className="sr-only">Search</span>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={v.q}
          onChange={(e) => update({ q: e.target.value }, true)}
          placeholder="Search medicine, molecule, manufacturer…"
          className={`${field} px-10`}
        />
        {pending && <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#0284C7]" />}
      </label>
      <select value={v.form} onChange={(e) => update({ form: e.target.value })} aria-label="Dosage form" className={field}>
        <option value="">All forms</option>
        {forms.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <select value={v.speciality} onChange={(e) => update({ speciality: e.target.value })} aria-label="Speciality" className={field}>
        <option value="">All specialities</option>
        {specialities.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select value={v.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort" className={field}>
        <option value="">Relevance</option>
        <option value="name">Name A–Z</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
        <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-[#4B6584]">
          <input type="checkbox" checked={v.stock} onChange={(e) => update({ stock: e.target.checked })} className="h-4 w-4 accent-[#0284C7]" />
          In stock
        </label>
        {dirty ? (
          <button
            type="button"
            onClick={() => update({ q: '', form: '', speciality: '', condition: '', stock: false })}
            className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-semibold text-[#0284C7] transition hover:bg-[#EAF6FF] lg:ml-0"
          >
            <X size={14} /> Clear
          </button>
        ) : null}
      </div>
      {v.condition && (
        <p className="text-sm text-[#4B6584] sm:col-span-2 lg:col-span-5">
          Condition: <strong className="text-[#082F49]">{v.condition}</strong>
        </p>
      )}
    </form>
  );
}
