import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { conditionIcon } from "@/components/conditions/conditionIcons";
import { conditions } from "@/lib/conditions";

export const metadata: Metadata = {
  title: "Conditions | Hexacare",
  description: "Browse Hexacare medicines by health condition.",
};

export default function ConditionsPage() {
  return (
    <div className="bg-[#F5FAFF]">
      <section className="border-b border-[#0284C7]/10 bg-gradient-to-b from-[#EAF6FF] to-[#F5FAFF] px-6 pb-10 pt-28 sm:px-10 sm:pt-32 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0284C7]">Shop by condition</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#082F49] sm:text-4xl lg:text-5xl">Conditions</h1>
          <p className="mt-3 max-w-2xl text-[#4B6584]">Choose a condition to see the medicines available for it.</p>
        </div>
      </section>

      <section className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {conditions.map((c) => {
            const Icon = conditionIcon(c.name);
            return (
              <Link
                key={c.slug}
                href={`/conditions/${c.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0284C7]/40 hover:shadow-xl hover:shadow-sky-500/10"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF6FF] text-[#0284C7] transition-colors group-hover:bg-[#0284C7] group-hover:text-white">
                  <Icon size={22} />
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-[#082F49]">{c.name}</span>
                <ArrowUpRight size={18} className="shrink-0 text-slate-300 transition group-hover:text-[#0284C7]" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
