import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import MedicineFilters from "@/components/medicines/MedicineFilters";
import MedicineCard from "@/components/medicines/MedicineCard";
import { dosageForms, medicines, searchMedicines, specialities, titleCase } from "@/lib/medicines";

export const metadata: Metadata = {
  title: "Medicines | Hexacare",
  description: "Browse the Hexacare medicine catalogue — search by name, molecule, manufacturer, form or speciality.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;


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

          <MedicineFilters
            initial={{ q: query.q ?? "", form: query.form ?? "", speciality: query.speciality ?? "", sort: query.sort ?? "", stock: query.stock === "in" }}
            forms={dosageForms.map((f) => ({ value: f, label: titleCase(f) }))}
            specialities={specialities}
          />
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm text-[#4B6584]">
            <p>
              <strong className="text-[#082F49]">{total.toLocaleString("en-IN")}</strong> medicines{filtered ? " match your filters" : ""}
            </p>
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
