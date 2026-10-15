import type { Metadata } from "next";
import ConditionCard from "@/components/conditions/ConditionCard";
import { conditions } from "@/lib/conditions";
import { conditionImage } from "@/lib/conditionImages";

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
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {conditions.map((c) => <ConditionCard key={c.slug} name={c.name} slug={c.slug} image={conditionImage(c.slug)} />)}
        </div>
      </section>
    </div>
  );
}
