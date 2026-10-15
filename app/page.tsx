import HomeClient from "@/components/home/HomeClient";
import MedicineCard from "@/components/medicines/MedicineCard";
import { conditions } from "@/lib/conditions";
import { featuredMedicines, specialityStats } from "@/lib/medicines";

const topConditions = () =>
  conditions
    .filter((c) => c.name !== "Others")
    .map((c) => ({ ...c, available: specialityStats(c.name).available }))
    .sort((a, b) => b.available - a.available)
    .slice(0, 6);

export default function Page() {
  return (
    <HomeClient
      conditions={topConditions()}
      featured={featuredMedicines(4).map((m) => <MedicineCard key={m.id} m={m} />)}
    />
  );
}
