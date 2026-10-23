import type { Action } from "../state";

/** Joint targets for the procedural rig (radians / metres). See ProceduralRig for the hierarchy. */
export interface Pose {
  bodyY: number;
  lean: number;
  headX: number;
  lSX: number;
  lSZ: number;
  lE: number;
  rSX: number;
  rSZ: number;
  rE: number;
  lH: number;
  lK: number;
  rH: number;
  rK: number;
  talk: number;
}

export const POSE_KEYS = [
  "bodyY",
  "lean",
  "headX",
  "lSX",
  "lSZ",
  "lE",
  "rSX",
  "rSZ",
  "rE",
  "lH",
  "lK",
  "rH",
  "rK",
  "talk",
] as const satisfies readonly (keyof Pose)[];

export const SIT_DROP = -0.42;

export const emptyPose = (): Pose => ({
  bodyY: 0,
  lean: 0,
  headX: 0,
  lSX: 0.04,
  lSZ: 0.08,
  lE: -0.15,
  rSX: 0.04,
  rSZ: -0.08,
  rE: -0.15,
  lH: 0,
  lK: 0,
  rH: 0,
  rK: 0,
  talk: 0,
});

const sin = Math.sin;

/**
 * Target pose for an action. `tint` (0 unwell → 1 recovered) slows and slumps every action so one
 * "walk" or "idle" reads as weak for the patient and confident for the experts.
 */
export function computePose(action: Action, t: number, tint: number, seated: number, carry: number): Pose {
  const p = emptyPose();
  const v = 0.55 + 0.45 * tint;
  const slump = 1 - tint;
  const breath = sin(t * 1.6) * 0.012;
  p.bodyY = breath * 0.5;
  p.lSX += sin(t * 1.2) * 0.03;
  p.rSX += sin(t * 1.2 + 1) * 0.03;

  switch (action) {
    case "idle":
      break;
    case "sitSick":
    case "sitPhone":
    case "cough": {
      p.lSX = -0.75;
      p.lE = -1.1;
      p.lSZ = -0.05;
      p.rSX = -0.75;
      p.rE = -1.1;
      p.rSZ = 0.05;
      p.headX = 0.3;
      p.lean = 0.12;
      if (action === "sitPhone") {
        p.rSX = -1.15;
        p.rE = -1.35;
        p.headX = 0.5;
      }
      if (action === "cough") {
        const burst = Math.max(0, sin(t * 2.4)) ** 2;
        p.rSX = -1.95;
        p.rE = -2.15;
        p.rSZ = -0.1;
        p.lean = 0.22 + sin(t * 20) * 0.05 * burst;
        p.headX = 0.4 + sin(t * 20) * 0.05 * burst;
      }
      break;
    }
    case "walk": {
      const w = t * (5.2 + 2.4 * v);
      const swing = 0.55 * v;
      p.lH = sin(w) * swing;
      p.rH = -sin(w) * swing;
      p.lK = Math.max(0, -sin(w + 1.2)) * 0.9 * v;
      p.rK = Math.max(0, sin(w + 1.2)) * 0.9 * v;
      p.lSX = -p.lH * 0.8;
      p.rSX = -p.rH * 0.8;
      p.bodyY += Math.abs(sin(w)) * 0.035 * v;
      if (carry > 0.5) {
        p.lSX = p.rSX = -1.15;
        p.lE = p.rE = -0.35;
        p.lSZ = -0.15;
        p.rSZ = 0.15;
      }
      break;
    }
    case "wave":
      p.rSZ = -2.55 + sin(t * 7) * 0.28;
      p.rE = -0.35;
      p.rSX = 0;
      p.headX = -0.05;
      p.talk = 1;
      break;
    case "talk":
      p.rSX = -0.55 + sin(t * 2.3) * 0.3;
      p.rE = -1.0 + sin(t * 3.1) * 0.2;
      p.lSX = -0.45 + sin(t * 2.7 + 1) * 0.25;
      p.lE = -0.9;
      p.rSZ = -0.25;
      p.lSZ = 0.25;
      p.headX = sin(t * 1.7) * 0.05;
      p.talk = 1;
      break;
    case "point":
      p.lSZ = 0.4;
      p.lE = -1.25;
      p.lSX = 0.1;
      p.rE = 0;
      p.talk = 1;
      p.lean = 0.04;
      break;
    case "handOver":
      p.lSX = p.rSX = -1.2 + sin(t * 2) * 0.03;
      p.lE = p.rE = -0.25;
      p.lSZ = -0.12;
      p.rSZ = 0.12;
      p.lean = 0.05;
      break;
    case "drink": {
      const s = (sin(t * 1.8) + 1) / 2;
      p.rSX = -1.35 - 0.5 * s;
      p.rE = -2.3;
      p.rSZ = -0.1;
      p.headX = -0.2 - 0.2 * s;
      break;
    }
    case "stretch": {
      const s = (sin(t * 1.5 - 1.2) + 1) / 2;
      p.lSX = p.rSX = -2.75 - 0.2 * s;
      p.lSZ = 0.3;
      p.rSZ = -0.3;
      p.lE = p.rE = -0.1;
      p.lean = -0.16 * s;
      p.headX = -0.25 * s;
      p.bodyY += 0.04 * s;
      break;
    }
    case "happy": {
      const j = Math.abs(sin(t * 4.2));
      p.bodyY += j * 0.22;
      p.lK = p.rK = (1 - j) * 0.4;
      p.lH = p.rH = -(1 - j) * 0.2;
      p.lSX = p.rSX = -2.5;
      p.lSZ = 0.5 + sin(t * 8.4) * 0.15;
      p.rSZ = -0.5 - sin(t * 8.4) * 0.15;
      p.lE = p.rE = -0.2;
      p.headX = -0.15;
      p.talk = 0.6;
      break;
    }
    case "celebrate": {
      const j = Math.abs(sin(t * 3.2 + 1));
      p.bodyY += j * 0.1;
      p.lSZ = 2.3 + sin(t * 6) * 0.2;
      p.rSZ = -2.3 - sin(t * 6 + 1) * 0.2;
      p.lSX = p.rSX = 0;
      p.lE = p.rE = -0.2;
      p.headX = -0.1;
      p.talk = 0.5;
      break;
    }
  }

  // unwell: shoulders and head fall forward, everything moves less
  p.lean += slump * 0.16;
  p.headX += slump * 0.22;
  if (slump > 0 && action !== "sitSick" && action !== "sitPhone" && action !== "cough") {
    p.lSX += slump * 0.12;
    p.rSX += slump * 0.12;
  }

  // seated blend: thighs forward, shins down, hips drop onto the seat
  p.lH += (-1.45 - p.lH) * seated;
  p.rH += (-1.45 - p.rH) * seated;
  p.lK += (1.5 - p.lK) * seated;
  p.rK += (1.5 - p.rK) * seated;
  p.bodyY += (SIT_DROP - p.bodyY) * seated;
  return p;
}
