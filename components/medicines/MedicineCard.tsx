import Link from "next/link";
import { type Medicine, inr, stockLabel, titleCase } from "@/lib/medicines";
import MedicineImage from "./MedicineImage";

export default function MedicineCard({ m }: { m: Medicine }) {
  const stock = stockLabel(m.in_stock);
  return (
    <Link
      href={`/medicines/${m.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7]/40 hover:shadow-xl hover:shadow-sky-500/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-sky-100">
        <MedicineImage src={m.image} alt={m.name} className="h-full w-full p-4 transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${stock.tone}`}>{stock.text}</span>
        {m.discount_percent ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#0284C7] px-2.5 py-1 text-[10px] font-bold text-white">{m.discount_percent}% OFF</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[2.75rem] font-bold leading-snug text-[#082F49] group-hover:text-[#0284C7]">{m.name}</h3>
        <p className="line-clamp-1 text-xs font-medium text-[#4B6584]">{titleCase(m.molecule) || "—"}</p>
        <div className="flex flex-wrap gap-1.5">
          {m.dosage_form && <span className="rounded-md bg-[#EAF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#0284C7]">{titleCase(m.dosage_form)}</span>}
          {m.rx_required && <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">Rx</span>}
          {m.cold_chain && <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-700">Cold chain</span>}
        </div>
        <p className="line-clamp-1 text-xs text-[#4B6584]">{titleCase(m.manufacturer)}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-extrabold text-[#082F49]">{inr(m.price)}</span>
          {m.mrp && m.price && m.mrp > m.price ? <span className="text-xs text-slate-400 line-through">{inr(m.mrp)}</span> : null}
        </div>
      </div>
    </Link>
  );
}
