import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import MedicineFilters from "@/components/medicines/MedicineFilters";
import Pagination from "@/components/medicines/Pagination";
import MedicineCard from "@/components/medicines/MedicineCard";
import { dosageForms, searchMedicines, specialities, titleCase } from "@/lib/medicines";

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
  const filtered = query.q || query.form || query.speciality || query.stock;

  return (
    <div className="bg-[#F5FAFF]">
      <section className="border-b border-[#0284C7]/10 bg-gradient-to-b from-[#EAF6FF] to-[#F5FAFF] px-6 pb-10 pt-28 sm:px-10 sm:pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7]">Medicine Catalogue</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#082F49] sm:text-4xl lg:text-5xl">Find the right medicine</h1>
          <p className="mt-3 max-w-2xl text-[#4B6584]">
            Products from trusted manufacturers. Search by brand, molecule or manufacturer.
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
          {filtered && (
            <p className="mb-6 text-sm text-[#4B6584]">
              <strong className="text-[#082F49]">{total.toLocaleString("en-IN")}</strong> medicines match your filters
            </p>
          )}

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

          <Pagination current={current} pages={pages} href={href} />
        </div>
      </section>
    </div>
  );
}
