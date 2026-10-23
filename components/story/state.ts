/** Mutable story state: the GSAP timeline writes it, the 3D scene reads it every frame (no React renders). */

export type Action =
  | "idle"
  | "sickIdle"
  | "sitSick"
  | "sitPhone"
  | "cough"
  | "walk"
  | "wave"
  | "talk"
  | "point"
  | "handOver"
  | "drink"
  | "stretch"
  | "happy"
  | "celebrate"
  | "nod"
  | "relieved"
  | "write"
  | "phone";

export interface CharState {
  /** 0..1 pop-in scale */
  visible: number;
  x: number;
  y: number;
  z: number;
  /** yaw in radians (0 faces +z) */
  ry: number;
  action: Action;
  seated: number;
  /** 0 = unwell (gray, slumped), 1 = recovered (warm, upright) */
  tint: number;
  /** world-space point the head should look at, and how strongly */
  lookX: number;
  lookY: number;
  lookZ: number;
  lookW: number;
  /** world-space point the pointing arm aims at */
  aimX: number;
  aimY: number;
  aimZ: number;
  /** 1 while carrying the parcel in both hands */
  carry: number;
}

export interface StoryState {
  time: number;
  cam: { px: number; py: number; pz: number; tx: number; ty: number; tz: number; fov: number };
  /** 1 during the particle intro (dark navy backdrop), then 0 */
  intro: number;
  particles: number; // formation 0..1
  particleFade: number; // 1 visible .. 0 gone
  logo: number; // 0..1 intro logo opacity
  world: number; // hex world reveal 0..1
  grade: number; // environment warmth 0 (cold, dim) .. 1 (bright, warm)
  pain: number; // symptom cloud 0..1
  phone: number; // phone + glowing hex 0..1
  cup: number;
  medicine: { x: number; y: number; z: number; visible: number };
  honey: number; // ambient wall honeycomb reveal
  svc: number[]; // six service cells reveal
  svcActive: number; // index of the glowing service cell, -1 none
  path: number; // hex path light progress 0..1
  city: number[]; // city tile reveal 0..1
  finale: number; // honeycomb resolves into logo
  /** floating "not available" tiles drifting apart 0..1 */
  lost: number;
  /** guide path lit from home toward the branch 0..1 */
  guide: number;
  /** quick dip-to-dark used to hide scene cuts 0..1 */
  cut: number;
  rx: { x: number; y: number; z: number; visible: number };
  patient: CharState;
  family: CharState;
  doctor: CharState;
  expert: CharState;
  delivery: CharState;
}

const char = (over: Partial<CharState> = {}): CharState => ({
  visible: 0,
  x: 0,
  y: 0,
  z: 0,
  ry: 0,
  action: "idle",
  seated: 0,
  tint: 1,
  lookX: 0,
  lookY: 1.5,
  lookZ: 6,
  lookW: 0,
  aimX: 0,
  aimY: 1,
  aimZ: 1,
  carry: 0,
  ...over,
});

export const createStoryState = (): StoryState => ({
  time: 0,
  cam: { px: 0, py: 31.5, pz: 7, tx: 0, ty: 31, tz: 0, fov: 38 },
  intro: 1,
  particles: 0,
  particleFade: 1,
  logo: 0,
  world: 0,
  grade: 0,
  pain: 0,
  phone: 0,
  cup: 0,
  medicine: { x: 15.7, y: 1, z: 2.27, visible: 0 },
  honey: 0,
  svc: [0, 0, 0, 0, 0, 0],
  svcActive: -1,
  path: 0,
  city: [0, 0, 0, 0],
  finale: 0,
  lost: 0,
  guide: 0,
  cut: 0,
  rx: { x: -16.2, y: 0.8, z: -0.6, visible: 0 },
  patient: char({ x: -14.6, z: -0.6, ry: -Math.PI / 2, action: "sitSick", seated: 1, tint: 0 }),
  family: char({ x: -13.4, z: -0.6, ry: -Math.PI / 2, tint: 0.3 }),
  doctor: char({ x: -17.2, z: -0.6, ry: Math.PI / 2 }),
  expert: char({ x: 12.4, z: 0, ry: 0.5 }),
  delivery: char({ x: 8.2, z: 2.27, ry: Math.PI / 2 }),
});

/** World layout shared by timeline and scene. */
export const LAYOUT = {
  home: { x: 0 },
  sofa: { x: -1.2, z: -2.0 },
  door: { x: 4.2, z: 2.27 },
  pathRow: { z: 2.27 },
  wall: { x: 16, y: 2.9, z: -2.2 },
  impact: { x: 32 },
  intro: { x: 0, y: 31, z: 0 },
  doctor: { x: -16 },
  /** cell lattice spacing for the floor */
  tile: 1.31,
  /** circumradius of a wall honeycomb cell */
  cell: 0.8,
};

/** Centre of wall honeycomb cell: k = -1 centre, 0..5 ring (clockwise from top), 6..17 outer ring. */
export const wallCellPos = (k: number): [number, number, number] => {
  const { x, y, z } = LAYOUT.wall;
  const d = Math.sqrt(3) * LAYOUT.cell * 1.06;
  if (k < 0) return [x, y, z];
  if (k < 6) {
    const a = Math.PI / 2 - (k * Math.PI) / 3;
    return [x + d * Math.cos(a), y + d * Math.sin(a), z];
  }
  const i = k - 6;
  const ring = i % 2 === 0 ? 2 * d : Math.sqrt(3) * d; // corner vs edge-midpoint
  const a = Math.PI / 2 - (i * Math.PI) / 6 - (i % 2 === 0 ? 0 : 0);
  return [x + ring * Math.cos(a), y + ring * Math.sin(a), z];
};

/** Positions of the four city tiles on the impact map, relative to the impact stage centre. */
export const CITY_OFFSETS: [number, number][] = [
  [2.9, -2.4], // Chennai (north-east)
  [-2.4, -0.2], // Coimbatore (west)
  [-0.6, 2.2], // Madurai (south)
  [0.6, 0.0], // Trichy (centre)
];
