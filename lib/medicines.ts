import "server-only";
import raw from "@/hexacare_products.json";

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  product_code: string;
  strength: string | null;
  molecule: string | null;
  manufacturer: string | null;
  country_of_origin: string | null;
  dosage_form: string | null;
  packing: string | null;
  mrp: number | null;
  price: number | null;
  discount_percent: number | null;
  in_stock: string;
  rx_required: boolean;
  cold_chain: boolean;
  imported: boolean;
  speciality: string[];
  condition: string[];
  hsn: string | null;
  tax_percent: number | null;
  image: string | null;
  images: string[];
  slug: string;
}

const rawProducts = (raw as unknown as { products: Medicine[] }).products;

// Some products share a slug in the source data. Keep the first as-is and add the
// product code to later ones so every medicine has its own page.
const seenSlugs = new Set<string>();
export const medicines: Medicine[] = rawProducts.map((m) => {
  let slug = m.slug;
  if (seenSlugs.has(slug)) slug = `${m.slug}-${m.product_code}`.toLowerCase();
  seenSlugs.add(slug);
  return slug === m.slug ? m : { ...m, slug };
});

const bySlug = new Map(medicines.map((m) => [m.slug, m]));
export const getMedicine = (slug: string) => bySlug.get(slug);

const rank = (values: string[]) => {
  const map = new Map<string, number>();
  values.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
};

export const dosageForms = rank(medicines.map((m) => m.dosage_form).filter((v): v is string => !!v)).slice(0, 12);
export const specialities = rank(medicines.flatMap((m) => m.speciality)).slice(0, 20);

export const stockLabel = (s: string) =>
  s === "available" || s === "maybe_available"
    ? { text: "In stock", tone: "bg-emerald-100 text-emerald-700" }
    : s === "out_of_stock"
      ? { text: "Out of stock", tone: "bg-amber-100 text-amber-700" }
      : { text: "Unavailable", tone: "bg-slate-200 text-slate-600" };

export const titleCase = (s: string | null) =>
  (s ?? "").toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

export const inr = (n: number | null) =>
  n == null ? "—" : `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export interface Query {
  q?: string;
  form?: string;
  speciality?: string;
  stock?: string;
  sort?: string;
  page?: number;
}

export const PAGE_SIZE = 24;

export function searchMedicines({ q, form, speciality, stock, sort, page = 1 }: Query) {
  const term = q?.trim().toLowerCase();
  let list = medicines.filter(
    (m) =>
      (!term ||
        m.name.toLowerCase().includes(term) ||
        m.molecule?.toLowerCase().includes(term) ||
        m.manufacturer?.toLowerCase().includes(term)) &&
      (!form || m.dosage_form === form) &&
      (!speciality || m.speciality.includes(speciality)) &&
      (stock !== "in" || m.in_stock === "available"),
  );
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "price-asc") list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else if (sort === "price-desc") list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  return { total: list.length, pages, current, items: list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE) };
}

export const isAvailable = (m: Medicine) => m.in_stock === "available";

export const specialityStats = (() => {
  const total = new Map<string, number>();
  const available = new Map<string, number>();
  medicines.forEach((m) =>
    m.speciality.forEach((c) => {
      total.set(c, (total.get(c) ?? 0) + 1);
      if (isAvailable(m)) available.set(c, (available.get(c) ?? 0) + 1);
    }),
  );
  return (name: string) => ({ total: total.get(name) ?? 0, available: available.get(name) ?? 0 });
})();

/** In-stock medicines with photos, best discounts first, one per molecule. */
export function featuredMedicines(limit = 4) {
  const seen = new Set<string>();
  return medicines
    .filter((m) => isAvailable(m) && m.image && m.price && m.discount_percent)
    .sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0))
    .filter((m) => {
      const key = m.molecule ?? m.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
