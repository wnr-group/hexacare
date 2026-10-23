/**
 * Hexacare story — edit this file to change the film without touching animation code.
 * Scene lengths are in seconds; every beat inside a scene is placed as a fraction of its scene,
 * so changing a scene's start/end re-times the whole scene proportionally.
 */

export type SceneKey =
  | "intro"
  | "illness"
  | "discover"
  | "services"
  | "delivery"
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

  tagline: "The right care, delivered.",

  /** Start/end second of each scene (ordered, contiguous). Total ≈ 58s. */
  scenes: {
    intro: [0, 6],
    illness: [6, 14],
    discover: [14, 20],
    services: [20, 30],
    delivery: [30, 38],
    recovery: [38, 46],
    impact: [46, 52],
    finale: [52, 58],
  } satisfies Record<SceneKey, [number, number]>,

  /** Seconds to hold the final CTA before the film loops softly. Set loop:false to end on the CTA. */
  loop: true,
  loopDelay: 7,
  /** Start playing when the section scrolls into view (it sits below the hero). */
  startWhenVisible: true,

  /** Captions are real DOM text. Times are in seconds on the master timeline. */
  captions: [
    { from: 0.8, to: 5.8, text: "The right care, delivered." },
    { from: 6.6, to: 13.6, text: "When illness makes everyday life hard…" },
    { from: 14.8, to: 19.6, text: "Hexacare is here to help." },
    { from: 20.4, to: 22.4, text: "Meet your Hexacare care expert." },
    { from: 30.4, to: 37.8, text: "Genuine medicine, handled with care, all the way to your door." },
    { from: 38.8, to: 45.8, text: "Feeling lighter. Feeling like yourself again." },
    { from: 46.4, to: 51.6, text: "Growing across the south, one community at a time." },
    { from: 52.6, to: 58, text: "Hexacare. The right care, delivered." },
  ],

  /** The six cells of the service honeycomb, in clockwise order from the top. */
  services: [
    { icon: "stethoscope", title: "Expert guidance", line: "Friendly specialists who explain every step." },
    { icon: "pill", title: "The right medicine", line: "Genuine therapies, sourced from manufacturers." },
    { icon: "file-text", title: "Prescription support", line: "We help you get your paperwork in order." },
    { icon: "snowflake", title: "Cold-chain care", line: "Temperature-aware storage and handling." },
    { icon: "truck", title: "Doorstep delivery", line: "Careful delivery, right to your home." },
    { icon: "heart-handshake", title: "Patient assistance", line: "People who stay with you after delivery." },
  ],

  /** Medicine journey along the hex path (30–34s). */
  pipeline: ["Prescription", "Pharmacy", "Packing", "Delivery"],

  /** Branches lit up in the impact scene (hex tile offsets are set in the timeline code). */
  cities: ["Chennai", "Coimbatore", "Madurai", "Trichy"],

  /** Counters shown in the impact scene — figures taken from the site's trust metrics. */
  stats: [
    { label: "Branches", value: 4, prefix: "", suffix: "" },
    { label: "Cities covered", value: 4000, prefix: "", suffix: "+" },
    { label: "Patient savings", value: 70, prefix: "₹", suffix: "Cr+" },
  ],

  cta: { label: "Contact us", href: "/contact" },

  /**
   * Rigged .glb files. Set `enabled: true` once the files exist in /public/models/.
   * A missing or broken file still falls back to the procedural character.
   */
  models: {
    enabled: false,
    patient: "/models/patient.glb",
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
  } as Record<string, string[]>,

  /** Total particles in the intro formation. */
  particles: { desktop: 1800, mobile: 700 },
} as const;

export type StoryConfig = typeof storyConfig;
