import HomeClient from "@/components/home/HomeClient";
import MedicineCard from "@/components/medicines/MedicineCard";
import { conditionStats, featuredMedicines } from "@/lib/medicines";

export default function Page() {
  return (
    <HomeClient
      conditions={conditionStats(6)}
      featured={featuredMedicines(4).map((m) => <MedicineCard key={m.id} m={m} />)}
    />
  );
}
