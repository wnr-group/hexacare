import HomeClient from "@/components/home/HomeClient";
import MedicineCard from "@/components/medicines/MedicineCard";
import { conditions } from "@/lib/conditions";
import { conditionImage } from "@/lib/conditionImages";
import { featuredMedicines } from "@/lib/medicines";

const allConditions = () =>
  [...conditions].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ ...c, image: conditionImage(c.slug) }));

export default function Page() {
  return (
    <HomeClient
      conditions={allConditions()}
      featured={featuredMedicines(4).map((m) => <MedicineCard key={m.id} m={m} />)}
    />
  );
}
