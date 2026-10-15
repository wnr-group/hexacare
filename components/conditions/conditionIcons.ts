import {
  Activity, Baby, Bone, Brain, Bug, Droplet, Droplets, Dna, FlaskConical, Heart, HeartPulse,
  Hospital, Leaf, Microscope, Pill, Ribbon, Scissors, ShieldCheck, Smile, Sparkles, Stethoscope,
  Syringe, Wind, type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "Allergy Medication": Sparkles, Alzheimers: Brain, Anaesthetics: Syringe, Anemia: Droplet,
  "Anti Cancer": Ribbon, Antibacterials: Bug, Anticoagulants: Droplets, Antifungal: Microscope,
  Antiviral: ShieldCheck, Arthritis: Bone, "Blood Disorder": Droplet, CBD: Leaf,
  "Diabetes Mellitus": Activity, "HIV/AIDS": Ribbon, "Hair Loss": Smile, "Heart Disorder": HeartPulse,
  Hepatitis: FlaskConical, Hypertension: Heart, IVF: Baby, "Immune Disorder": ShieldCheck,
  Immunoglobulins: Dna, "Injections & Vaccine": Syringe, "Iron Deficiency": Droplet,
  "Kidney Disease": Activity, "Liver Disease": FlaskConical, "Medical Aid": Hospital,
  "Mental Wellness": Brain, "Multiple Sclerosis": Brain, "Nerve Disorder": Brain,
  "Nutrient Deficiency": Leaf, Osteoporosis: Bone, Others: Pill, "Respiratory Disorder": Wind,
  "Sexual Wellness": Heart, "Skin Care": Sparkles, Transplant: Scissors,
};

export const conditionIcon = (name: string): LucideIcon => icons[name] ?? Stethoscope;
