/**
 * Hexacare story — edit this file to change the film without touching animation code.
 * Scene lengths are in seconds; every beat inside a scene is placed as a fraction of its scene,
 * so changing a scene's start/end re-times the whole scene proportionally.
 */

export type SceneKey =
  | "intro"
  | "diagnosis"
  | "search"
  | "discover"
  | "services"
  | "supply"
  | "recovery"
  | "impact"
  | "finale";

export const storyConfig = {
  brand: {
    name: "Hexacare",
    logo: "/hexacare-logo.png",
    colors: {
      primary: "#0284C7",
      accent: "#22D3EE",
      deep: "#082F49",
      sky: "#EAF6FF",
      warm: "#FFB547", // recovery / sunlight accent
      sick: "#7C8DA3", // cold gray-blue used for the illness look
    },
  },

  tagline: "Life-saving medicines, delivered with care.",

  /** Shown as a small line at the bottom of the story (prescription medicines). */
  footnote: "Medicines are supplied on valid prescription.",

  /** Start/end second of each scene (ordered, contiguous). Total ≈ 64s. */
  scenes: {
    intro: [0, 6],
    diagnosis: [6, 14],
    search: [14, 22],
    discover: [22, 30],
    services: [30, 42],
    supply: [42, 50],
    recovery: [50, 57],
    impact: [57, 60.5],
    finale: [60.5, 64],
  } satisfies Record<SceneKey, [number, number]>,

  /** Seconds to hold the final CTA before the film loops softly. Set loop:false to end on the CTA. */
  loop: true,
  loopDelay: 7,
  /** Start playing when the section scrolls into view. */
  startWhenVisible: true,

  /** Captions are real DOM text. Times are in seconds on the master timeline. */
  captions: [
    { from: 0.8, to: 5.8, text: "Life-saving medicines, delivered with care." },
    { from: 6.6, to: 13.4, text: "When treatment needs specialized medicines…" },
    { from: 14.6, to: 21.6, text: "…finding the right, genuine medicine is the hardest part." },
    { from: 22.8, to: 29.6, text: "Hexacare, Chennai, since 2015." },
    { from: 30.4, to: 32.4, text: "Meet your Hexacare pharmacist." },
    { from: 42.5, to: 49.6, text: "Sourced, checked, stored and dispatched with care." },
    { from: 50.8, to: 56.8, text: "Care that reaches you." },
    { from: 57.2, to: 60.2, text: "Growing across Tamil Nadu, one community at a time." },
    { from: 61.0, to: 64, text: "Life-saving medicines, delivered with care." },
  ],

  /** The cells of the service honeycomb, clockwise from the top (max 6). */
  services: [
    { icon: "ribbon", title: "Cancer care medicines", line: "Specialty therapies for oncology treatment." },
    { icon: "microscope", title: "Virology medicines", line: "Antiviral medicines, genuinely sourced." },
    { icon: "heart-pulse", title: "Transplant medicines", line: "Specialty medicines for transplant care." },
    { icon: "pill", title: "Branded & generic specialty drugs", line: "Options to suit the prescription." },
    { icon: "shield-check", title: "Genuine, verified supply", line: "Verified sourcing you can trust." },
    { icon: "truck", title: "Reliable delivery", line: "Careful dispatch to hospitals, clinics and homes." },
  ],

  /** Medicine journey along the hex path (supply scene). */
  pipeline: ["Sourcing", "Quality check", "Storage", "Dispatch"],

  /** Lit on the reach map: Chennai HQ (Teynampet) plus the other branches. */
  cities: ["Chennai (HQ)", "Coimbatore", "Madurai", "Trichy"],

  /** Reach counters. Add a "Hospitals served" entry here once you have a verified figure. */
  stats: [
    { label: "Years since 2015", value: new Date().getFullYear() - 2015, prefix: "", suffix: "" },
    { label: "Branches", value: 4, prefix: "", suffix: "" },
    { label: "Cities covered", value: 4000, prefix: "", suffix: "+" },
  ],

  cta: { label: "Contact us", href: "/contact" },

  /**
   * Rigged .glb files. Set `enabled: true` once the files exist in /public/models/.
   * A missing or broken file still falls back to the procedural character.
   */
  models: {
    enabled: false,
    patient: "/models/patient.glb",
    family: "/models/family.glb",
    doctor: "/models/doctor.glb",
    expert: "/models/expert.glb",
    delivery: "/models/delivery.glb",
  },

  /** Animation clip names searched (case-insensitive, substring) per action when a .glb is used. */
  clipMap: {
    idle: ["idle"],
    sickIdle: ["sick idle", "sick", "tired"],
    cough: ["cough", "tired"],
    walk: ["walk"],
    wave: ["wave"],
    talk: ["talk"],
    point: ["point"],
    handOver: ["hand", "give"],
    drink: ["drink", "take"],
    stretch: ["stretch"],
    happy: ["happy", "jump"],
    celebrate: ["celebrate", "cheer"],
    nod: ["nod"],
    relieved: ["relieved", "relief"],
    write: ["write", "talk"],
    phone: ["phone", "idle"],
  } as Record<string, string[]>,

  /** Total particles in the intro formation. */
  particles: { desktop: 1800, mobile: 700 },
} as const;

export type StoryConfig = typeof storyConfig;
