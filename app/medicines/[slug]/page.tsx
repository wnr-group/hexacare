import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Factory, Snowflake, Stethoscope, Globe2 } from "lucide-react";
import WhatsAppIcon from "@/components/common/WhatsAppIcon";
import MedicineGallery from "@/components/medicines/MedicineGallery";
import MedicineCard from "@/components/medicines/MedicineCard";
import { getMedicine, inr, medicines, stockLabel, titleCase } from "@/lib/medicines";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = getMedicine((await params).slug);
  if (!m) return { title: "Medicine not found | Hexacare" };
  return {
    title: `${m.name} | Hexacare`,
    description: `${m.name}${m.molecule ? ` (${titleCase(m.molecule)})` : ""} by ${titleCase(m.manufacturer)}. ${m.packing ?? ""}`,
  };
}

export default async function MedicineDetailPage({ params }: Props) {
  const m = getMedicine((await params).slug);
  if (!m) notFound();

  const stock = stockLabel(m.in_stock);
  const images = m.images.length ? m.images : m.image ? [m.image] : [];
  const save = m.mrp && m.price && m.mrp > m.price ? m.mrp - m.price : 0;
  const related = medicines
    .filter((x) => x.id !== m.id && (m.molecule ? x.molecule === m.molecule : x.speciality[0] === m.speciality[0]))
    .slice(0, 4);
  const waText = encodeURIComponent(`Hello Hexacare, I would like to enquire about ${m.name} (Code: ${m.product_code}).`);

  const specs: [string, string | null][] = [
    ["Molecule / Salt", titleCase(m.molecule)],
    ["Strength", m.strength],
    ["Dosage form", titleCase(m.dosage_form)],
    ["Packing", m.packing],
    ["Manufacturer", titleCase(m.manufacturer)],
    ["Country of origin", m.country_of_origin],
    ["Product code", m.product_code],
    ["HSN code", m.hsn],
    ["GST", m.tax_percent != null ? `${m.tax_percent}%` : null],
  ];

  return (
    <div className="bg-[#F5FAFF] px-6 pb-20 pt-28 sm:px-10 sm:pt-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Link href="/medicines" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] hover:underline">
          <ArrowLeft size={16} /> Back to medicines
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
          <MedicineGallery images={images} alt={m.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${stock.tone}`}>{stock.text}</span>
              {m.rx_required && <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600">Prescription required</span>}
              {m.cold_chain && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700"><Snowflake size={12} /> Cold chain</span>}
              {m.imported && <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700"><Globe2 size={12} /> Imported</span>}
            </div>

            <h1 className="mt-3 text-xl font-extrabold leading-tight text-[#082F49] sm:text-2xl lg:text-[1.75rem]">{m.name}</h1>
            {m.molecule && <p className="mt-1 text-sm font-medium text-[#4B6584]">{titleCase(m.molecule)}</p>}
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#4B6584] sm:text-sm"><Factory size={14} /> {titleCase(m.manufacturer)}</p>

            <div className="mt-4 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl font-extrabold text-[#082F49] sm:text-3xl">{inr(m.price)}</span>
                {save > 0 && <span className="text-base text-slate-400 line-through">{inr(m.mrp)}</span>}
                {m.discount_percent ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{m.discount_percent}% OFF</span> : null}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-[#4B6584] sm:text-xs">
                {save > 0 ? `You save ${inr(save)} · ` : ""}Per {m.packing ? m.packing.toLowerCase() : "pack"} · Inclusive of taxes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/919832487454?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-[13px] font-bold text-white shadow-md shadow-emerald-500/25 transition hover:bg-[#1EBE5A] active:scale-[0.98]"
                >
                  <WhatsAppIcon size={16} /> Enquire on WhatsApp
                </a>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-lg border border-[#0284C7]/30 bg-[#EAF6FF] px-3.5 py-2 text-[13px] font-bold text-[#0284C7] transition hover:bg-[#0284C7] hover:text-white">
                  Contact us
                </Link>
              </div>
            </div>

            {m.rx_required && (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3.5 text-sm text-amber-800">
                <Stethoscope size={18} className="mt-0.5 shrink-0" /> A valid prescription is required to purchase this medicine.
              </p>
            )}

            {(m.speciality.length > 0 || m.condition.length > 0) && (
              <div className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#082F49]">Used in</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[...m.speciality, ...m.condition].map((t) => (
                    <Link key={t} href={`/medicines?speciality=${encodeURIComponent(t)}`} className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold text-[#0284C7] hover:bg-[#EAF6FF]">
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-12 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
          <h2 className="flex items-center gap-2 bg-[#082F49] px-5 py-4 font-bold text-white sm:px-6"><BadgeCheck size={18} /> Product details</h2>
          <dl className="grid divide-y divide-sky-100 sm:grid-cols-2 sm:divide-y-0">
            {specs.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-3.5 text-sm sm:border-b sm:border-sky-100 sm:px-6 sm:[&:nth-child(odd)]:border-r">
                <dt className="font-medium text-[#4B6584]">{k}</dt>
                <dd className="text-right font-semibold text-[#082F49]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-extrabold text-[#082F49] sm:text-2xl">{m.molecule ? "Same molecule" : "Related medicines"}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => <MedicineCard key={r.id} m={r} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
