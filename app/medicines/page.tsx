import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, SearchX } from "lucide-react";
import MedicineCard from "@/components/medicines/MedicineCard";
import { dosageForms, medicines, searchMedicines, specialities, titleCase } from "@/lib/medicines";

export const metadata: Metadata = {
  title: "Medicines | Hexacare",
  description: "Browse the Hexacare medicine catalogue — search by name, molecule, manufacturer, form or speciality.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

const field =
  "w-full rounded-xl border border-sky-200 bg-white px-3.5 py-2.5 text-sm text-[#082F49] outline-none transition focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20";

export default async function MedicinesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const query = {
    q: one(sp.q),
    form: one(sp.form),
    speciality: one(sp.speciality),
    stock: one(sp.stock),
    sort: one(sp.sort),
    page: Number(one(sp.page)) || 1,
  };
  const { total, pages, current, items } = searchMedicines(query);

  const href = (page: number) => {
    const p = new URLSearchParams();
    Object.entries({ ...query, page: page > 1 ? page : undefined }).forEach(([k, v]) => v && p.set(k, String(v)));
    const s = p.toString();
    return s ? `/medicines?${s}` : "/medicines";
  };
  const shown = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - current) <= 1);
  const filtered = query.q || query.form || query.speciality || query.stock;

  return (
    <div className="bg-[#F5FAFF]">
      <section className="border-b border-[#0284C7]/10 bg-gradient-to-b from-[#EAF6FF] to-[#F5FAFF] px-6 pb-10 pt-28 sm:px-10 sm:pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7]">Medicine Catalogue</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#082F49] sm:text-4xl lg:text-5xl">Find the right medicine</h1>
          <p className="mt-3 max-w-2xl text-[#4B6584]">
            {medicines.length.toLocaleString("en-IN")} products from trusted manufacturers. Search by brand, molecule or manufacturer.
          </p>

          <form
            action="/medicines"
            className="mt-8 grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center"
          >
            <label className="relative block sm:col-span-2 lg:col-span-1">
              <span className="sr-only">Search</span>
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" defaultValue={query.q} placeholder="Search medicine, molecule, manufacturer…" className={`${field} pl-10`} />
            </label>
            <select name="form" defaultValue={query.form ?? ""} aria-label="Dosage form" className={field}>
              <option value="">All forms</option>
              {dosageForms.map((f) => <option key={f} value={f}>{titleCase(f)}</option>)}
            </select>
            <select name="speciality" defaultValue={query.speciality ?? ""} aria-label="Speciality" className={field}>
              <option value="">All specialities</option>
              {specialities.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="sort" defaultValue={query.sort ?? ""} aria-label="Sort" className={field}>
              <option value="">Relevance</option>
              <option value="name">Name A–Z</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
            <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
              <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-[#4B6584]">
                <input type="checkbox" name="stock" value="in" defaultChecked={query.stock === "in"} className="h-4 w-4 accent-[#0284C7]" />
                In stock
              </label>
              <button className="ml-auto cursor-pointer rounded-xl bg-[#0284C7] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-[#075985] active:scale-95 lg:ml-0">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-[#4B6584]">
            <p>
              <strong className="text-[#082F49]">{total.toLocaleString("en-IN")}</strong> medicines{filtered ? " match your filters" : ""}
            </p>
            {filtered && <Link href="/medicines" className="font-semibold text-[#0284C7] hover:underline">Clear filters</Link>}
          </div>

          {items.length ? (
            <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((m) => <MedicineCard key={m.id} m={m} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-sky-200 bg-white py-20 text-center">
              <SearchX size={40} className="text-[#0284C7]/50" />
              <p className="mt-4 text-lg font-bold text-[#082F49]">No medicines found</p>
              <p className="mt-1 text-sm text-[#4B6584]">Try a different keyword or clear the filters.</p>
            </div>
          )}

          {pages > 1 && (
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
          )}
        </div>
      </section>
    </div>
  );
}
