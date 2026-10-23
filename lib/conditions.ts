export const conditionNames = [
  "Allergy Medication", "Alzheimers", "Anaesthetics", "Anemia", "Anti Cancer", "Antibacterials",
  "Anticoagulants", "Antifungal", "Antiviral", "Arthritis", "Blood Disorder", "CBD",
  "Diabetes Mellitus", "HIV/AIDS", "Hair Loss", "Heart Disorder", "Hepatitis", "Hypertension",
  "IVF", "Immune Disorder", "Immunoglobulins", "Injections & Vaccine", "Iron Deficiency",
  "Kidney Disease", "Liver Disease", "Medical Aid", "Mental Wellness", "Multiple Sclerosis",
  "Nerve Disorder", "Nutrient Deficiency", "Osteoporosis", "Others", "Respiratory Disorder",
  "Sexual Wellness", "Skin Care", "Transplant",
] as const;

export const slugify = (name: string) =>
  name.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const conditions = conditionNames.map((name) => ({ name: name as string, slug: slugify(name) }));

export const getCondition = (slug: string) => conditions.find((c) => c.slug === slug);
