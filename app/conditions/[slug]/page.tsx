import { createElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, SearchX } from "lucide-react";
import { conditionIcon } from "@/components/conditions/conditionIcons";
import MedicineCard from "@/components/medicines/MedicineCard";
import MedicineFilters from "@/components/medicines/MedicineFilters";
import Pagination from "@/components/medicines/Pagination";
import { conditions, getCondition } from "@/lib/conditions";
import { dosageForms, searchMedicines, titleCase } from "@/lib/medicines";

type SP = Record<string, string | string[] | undefined>;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SP> };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export const generateStaticParams = () => conditions.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const c = getCondition((await params).slug);
  return c
    ? { title: `${c.name} Medicines | Hexacare`, description: `Browse ${c.name} medicines available at Hexacare.` }
    : { title: "Condition not found | Hexacare" };
}

export default async function ConditionPage({ params, searchParams }: Props) {
  const c = getCondition((await params).slug);
  if (!c) notFound();
  const sp = await searchParams;
  const query = { q: one(sp.q), form: one(sp.form), stock: one(sp.stock), sort: one(sp.sort), page: Number(one(sp.page)) || 1 };
  const { total, pages, current, items } = searchMedicines({ ...query, speciality: c.name });
  const base = `/conditions/${c.slug}`;

  const href = (page: number) => {
    const p = new URLSearchParams();
    Object.entries({ ...query, page: page > 1 ? page : undefined }).forEach(([k, v]) => v && p.set(k, String(v)));
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="bg-[#F5FAFF]">
      <section className="border-b border-[#0284C7]/10 bg-gradient-to-b from-[#EAF6FF] to-[#F5FAFF] px-6 pb-10 pt-28 sm:px-10 sm:pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link href="/conditions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] hover:underline">
            <ArrowLeft size={16} /> All conditions
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0284C7] text-white shadow-lg shadow-sky-500/20">
              {createElement(conditionIcon(c.name), { size: 28 })}
            </span>
            <div>
              <h1 className="text-3xl font-extrabold text-[#082F49] sm:text-4xl">{c.name}</h1>
              <p className="mt-1 text-sm text-[#4B6584]">Medicines for {c.name.toLowerCase()}</p>
            </div>
          </div>
          <MedicineFilters
            key={c.slug}
            basePath={base}
            hideSpeciality
            initial={{ q: query.q ?? "", form: query.form ?? "", speciality: "", sort: query.sort ?? "", stock: query.stock === "in" }}
            forms={dosageForms.map((f) => ({ value: f, label: titleCase(f) }))}
            specialities={[]}
          />
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {(query.q || query.form || query.stock) && (
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
