"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CITY_OFFSETS, LAYOUT, wallCellPos } from "./state";
import { useStory } from "./context";
import { storyConfig } from "./story.config";

type Group = "floor" | "path" | "svc" | "outer" | "center" | "city";
interface Cell {
  group: Group;
  idx: number;
  x: number;
  y: number;
  z: number;
  hash: number;
  t: number; // path order 0..1 (east → west) for path cells
}

const D = LAYOUT.tile;
const ROW_H = D * Math.sqrt(3) / 2;
const R_FLOOR = (D / Math.sqrt(3)) * 0.95;
const col = (hex: string) => new THREE.Color(hex);
const C = storyConfig.brand.colors;
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function buildFloor(): Cell[] {
  const cells: Cell[] = [];
  const pathMin = 4 * D;
  const pathMax = 12 * D;
  let n = 0;
  for (let rz = -4; rz <= 13; rz++) {
    const z = rz * ROW_H;
    const off = Math.abs(rz) % 2 === 1 ? D / 2 : 0;
    for (let cx = -6; cx <= 29; cx++) {
      const x = cx * D + off;
      const onPath = rz === 2 && x >= pathMin - 0.01 && x <= pathMax + 0.01;
      cells.push({
        group: onPath ? "path" : "floor",
        idx: n++,
        x,
        y: 0,
        z,
        hash: hash(n),
        t: onPath ? 1 - (x - pathMin) / (pathMax - pathMin) : 0,
      });
    }
  }
  return cells;
}

/** Wall honeycomb + city tiles: upright/tall hex prisms (axis along z for the wall). */
function buildWall(): Cell[] {
  const cells: Cell[] = [];
  const [cx, cy, cz] = wallCellPos(-1);
  cells.push({ group: "center", idx: 0, x: cx, y: cy, z: cz, hash: 0.5, t: 0 });
  for (let k = 0; k < 18; k++) {
    const [x, y, z] = wallCellPos(k);
    cells.push({ group: k < 6 ? "svc" : "outer", idx: k < 6 ? k : k - 6, x, y, z, hash: hash(k + 40), t: 0 });
  }
  return cells;
}

const floorGeo = new THREE.CylinderGeometry(R_FLOOR, R_FLOOR, 1, 6);
// wall cells: axis along z, pointy-top so neighbours sit at 0°,60°,…
const wallGeo = new THREE.CylinderGeometry(LAYOUT.cell, LAYOUT.cell, 1, 6).rotateX(Math.PI / 2);

const cityGeo = new THREE.CylinderGeometry(R_FLOOR * 1.5, R_FLOOR * 1.5, 1, 6);

export function HexCell() {
  const story = useStory();
  const floorRef = useRef<THREE.InstancedMesh>(null);
  const wallRef = useRef<THREE.InstancedMesh>(null);
  const cityRef = useRef<THREE.InstancedMesh>(null);
  const floor = useMemo(() => buildFloor(), []);
  const wall = useMemo(() => buildWall(), []);
  const mats = useMemo(
    () => ({
      floor: new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }),
      wall: new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.1 }),
    }),
    [],
  );
  const tmp = useMemo(
    () => ({
      o: new THREE.Object3D(),
      c: new THREE.Color(),
      cold: col("#7F93A8"),
      mid: col("#CFE6F7"),
      warm: col("#FFF0DA"),
      primary: col(C.primary),
      accent: col(C.accent),
      sky: col("#BFE3F8"),
      deep: col(C.deep),
      white: col("#F4FBFF"),
    }),
    [],
  );

  useEffect(() => {
    const white = new THREE.Color(1, 1, 1);
    [floorRef, wallRef, cityRef].forEach((r) => {
      const m = r.current;
      if (!m) return;
      for (let i = 0; i < m.count; i++) m.setColorAt(i, white);
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { o, c } = tmp;
    const g = story.grade;
    const fm = floorRef.current;
    if (fm) {
      const base = c;
      for (let i = 0; i < floor.length; i++) {
        const cell = floor[i];
        const s = easeOutBack(clamp01(story.world * 1.7 - cell.hash * 0.7));
        let y = -0.1 - (1 - clamp01(story.world)) * 0.4;
        let h = 0.2;
        // ground colour grade
        if (g < 0.55) base.lerpColors(tmp.cold, tmp.mid, g / 0.55);
        else base.lerpColors(tmp.mid, tmp.warm, (g - 0.55) / 0.45);
        base.multiplyScalar(0.92 + 0.1 * cell.hash);
        if (cell.group === "path") {
          const lit = clamp01((story.path - cell.t * 0.9) * 6);
          const wave = 0.5 + 0.5 * Math.sin(t * 3 - cell.t * 8);
          if (lit > 0) {
            y += 0.1 * lit;
            h += 0.04 * lit;
            base.lerp(tmp.accent, lit * 0.8).multiplyScalar(1 + lit * (0.7 + 0.7 * wave));
          } else base.lerp(tmp.sky, 0.25);
        }
        if (cell.group === "floor" && cell.x > 24 && cell.x < 40) base.lerp(tmp.sky, 0.2);
        o.position.set(cell.x, y + 0.0, cell.z);
        o.scale.set(Math.max(s, 0.0001), Math.max(h, 0.01) * Math.max(s, 0.0001), Math.max(s, 0.0001));
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        fm.setMatrixAt(i, o.matrix);
        fm.setColorAt(i, base);
      }
      fm.instanceMatrix.needsUpdate = true;
      if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
    }

    const wm = wallRef.current;
    if (wm) {
      const fin = story.finale;
      const [wx, wy, wz] = wallCellPos(-1);
      for (let i = 0; i < wall.length; i++) {
        const cell = wall[i];
        let s = 0;
        let glow = 1;
        c.copy(tmp.primary);
        if (cell.group === "center") {
          s = easeOutBack(clamp01(story.honey * 1.2));
          c.copy(tmp.white).multiplyScalar(0.9 + 0.3 * fin);
          if (fin > 0) c.lerp(tmp.accent, 0.15 * Math.sin(t * 2) + 0.1 * fin);
        } else if (cell.group === "svc") {
          const r = clamp01(story.svc[cell.idx]);
          s = easeOutBack(r);
          const active = story.svcActive === cell.idx;
          c.copy(active ? tmp.accent : tmp.primary);
          glow = active ? 1.8 + 0.4 * Math.sin(t * 6) : 1 + 0.35 * fin;
          if (fin > 0) c.lerp(tmp.accent, 0.35 * fin);
        } else {
          s = easeOutBack(clamp01(story.honey * 1.3 - cell.hash * 0.4)) * (1 - 0.65 * fin);
          c.copy(tmp.sky).lerp(tmp.primary, 0.2 + 0.15 * Math.sin(t * 1.5 + cell.hash * 6));
          glow = 1.15;
        }
        s = Math.max(s, 0.0001);
        const k = 1 - 0.06 * fin;
        o.position.set(wx + (cell.x - wx) * k, wy + (cell.y - wy) * k + 0.02 * Math.sin(t + cell.hash * 9), wz);
        o.scale.set(s * 0.96, s * 0.96, 0.3 * s);
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        wm.setMatrixAt(i, o.matrix);
        wm.setColorAt(i, c.multiplyScalar(glow));
      }
      wm.instanceMatrix.needsUpdate = true;
      if (wm.instanceColor) wm.instanceColor.needsUpdate = true;
    }

    const cm = cityRef.current;
    if (cm) {
      for (let i = 0; i < CITY_OFFSETS.length; i++) {
        const r = clamp01(story.city[i]);
        const s = Math.max(easeOutBack(r), 0.0001);
        const h = (0.15 + 1.1 * r) * (1 + 0.04 * Math.sin(t * 2 + i));
        o.position.set(LAYOUT.impact.x + CITY_OFFSETS[i][0], h / 2 - 0.05, CITY_OFFSETS[i][1]);
        o.scale.set(s, Math.max(h, 0.01), s);
        o.rotation.set(0, 0, 0);
        o.updateMatrix();
        cm.setMatrixAt(i, o.matrix);
        c.copy(tmp.primary).lerp(tmp.accent, r).multiplyScalar(1 + r * 1.2);
        cm.setColorAt(i, c);
      }
      cm.instanceMatrix.needsUpdate = true;
      if (cm.instanceColor) cm.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={floorRef} args={[floorGeo, mats.floor, floor.length]} frustumCulled={false} receiveShadow />
      <instancedMesh ref={wallRef} args={[wallGeo, mats.wall, wall.length]} frustumCulled={false} />
      <instancedMesh ref={cityRef} args={[cityGeo, mats.wall, CITY_OFFSETS.length]} frustumCulled={false} />
    </group>
  );
}

export default HexCell;
