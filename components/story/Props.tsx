"use client";
/* R3F frame loops intentionally mutate three.js objects and the shared story state every frame. */
/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useStory } from "./context";
import { CITY_OFFSETS, LAYOUT } from "./state";
import { storyConfig } from "./story.config";

const C = storyConfig.brand.colors;

/** Small seeded PRNG so the particle layout is deterministic and render-pure. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- intro: particles → hex cell + logo */
export function IntroStage({ count }: { count: number }) {
  const story = useStory();
  const logo = useTexture(storyConfig.brand.logo);
  const dot = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }, []);
  const pts = useRef<THREE.Points>(null);
  const glow = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const logoMesh = useRef<THREE.Mesh>(null);
  const I = LAYOUT.intro;

  const { start, target, geo } = useMemo(() => {
    const rnd = mulberry32(7);
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const R = 1.5;
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const rr = 5 + rnd() * 9;
      start[i * 3] = Math.cos(a) * rr;
      start[i * 3 + 1] = (rnd() - 0.5) * 12;
      start[i * 3 + 2] = Math.sin(a) * rr - 2;
      // target: perimeter of a hexagon (70%) or filled interior (30%)
      if (rnd() < 0.7) {
        const e = Math.floor(rnd() * 6);
        const f = rnd();
        const a0 = (e * Math.PI) / 3 + Math.PI / 6;
        const a1 = ((e + 1) * Math.PI) / 3 + Math.PI / 6;
        target[i * 3] = R * ((1 - f) * Math.cos(a0) + f * Math.cos(a1));
        target[i * 3 + 1] = R * ((1 - f) * Math.sin(a0) + f * Math.sin(a1));
      } else {
        const a = rnd() * Math.PI * 2;
        const rr = Math.sqrt(rnd()) * R * 0.82;
        target[i * 3] = Math.cos(a) * rr;
        target[i * 3 + 1] = Math.sin(a) * rr;
      }
      target[i * 3 + 2] = (rnd() - 0.5) * 0.12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { start, target, geo };
  }, [count]);

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = story.particles;
    const visible = story.particleFade > 0.01;
    if (pts.current) {
      pts.current.visible = visible;
      if (visible) {
        const pos = geo.attributes.position as THREE.BufferAttribute;
        const e = p * p * (3 - 2 * p);
        for (let i = 0; i < count; i++) {
          const o = i * 3;
          const w = e < 1 ? Math.sin(t * 2 + i) * 0.08 * (1 - e) : 0;
          pos.array[o] = I.x + start[o] + (target[o] - start[o]) * e + w;
          pos.array[o + 1] = I.y + start[o + 1] + (target[o + 1] - start[o + 1]) * e + w;
          pos.array[o + 2] = I.z + start[o + 2] + (target[o + 2] - start[o + 2]) * e;
        }
        pos.needsUpdate = true;
        (pts.current.material as THREE.PointsMaterial).opacity = story.particleFade;
      }
    }
    if (ring.current) {
      ring.current.visible = visible;
      ring.current.scale.setScalar(0.9 + 0.1 * p + 0.015 * Math.sin(t * 2));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p - 0.5) * 2 * story.particleFade;
    }
    if (glow.current) {
      glow.current.visible = story.particleFade > 0.01;
      (glow.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * story.particles * story.particleFade;
    }
    if (logoMesh.current) {
      logoMesh.current.visible = story.logo > 0.01 && story.particleFade > 0.01;
      (logoMesh.current.material as THREE.MeshBasicMaterial).opacity = story.logo * story.particleFade;
      logoMesh.current.scale.setScalar(1.35 * (0.85 + 0.15 * story.logo));
    }
  });

  return (
    <group>
      <points ref={pts} geometry={geo} frustumCulled={false}>
        <pointsMaterial size={0.06} map={dot} alphaTest={0.02} color={C.accent} transparent opacity={1} depthWrite={false} sizeAttenuation toneMapped={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh ref={ring} position={[I.x, I.y, I.z]} rotation={[0, 0, Math.PI / 6]}>
        <ringGeometry args={[1.47, 1.54, 6]} />
        <meshBasicMaterial color={C.accent} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glow} position={[I.x, I.y, I.z - 0.02]} scale={3.2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={dot} color={C.primary} transparent opacity={0.55} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={logoMesh} position={[I.x, I.y, I.z + 0.01]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={logo} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

const BLOBS: [number, number, number, number][] = [
  [-0.3, 0, 0, 0.22],
  [0, 0.08, 0, 0.3],
  [0.3, 0, 0, 0.22],
];

/* ---------------------------------------------------------------- symptom cloud above the patient */
export function PainCloud() {
  const story = useStory();
  const g = useRef<THREE.Group>(null);
  const puffs = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: C.sick, roughness: 1, transparent: true, opacity: 0.8 }), []);
  const icon = useMemo(() => new THREE.MeshBasicMaterial({ color: "#d9e4ef", transparent: true }), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = story.pain;
    if (!g.current) return;
    g.current.visible = p > 0.01;
    g.current.position.set(story.patient.x, 2.05 + Math.sin(t * 1.3) * 0.06 + (1 - p) * 0.8, story.patient.z + 0.05);
    g.current.scale.setScalar(Math.max(0.001, p));
    mat.opacity = 0.8 * p;
    icon.opacity = p;
    puffs.current?.children.forEach((c, i) => {
      c.position.y = Math.sin(t * 1.5 + i * 1.7) * 0.03;
    });
  });
  return (
    <group ref={g} visible={false}>
      <group ref={puffs}>
        {BLOBS.map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} material={mat}>
            <sphereGeometry args={[r, 16, 12]} />
          </mesh>
        ))}
      </group>
      {/* small abstract symptom icon: a droplet-like hex with a wave */}
      <mesh position={[0, 0.08, 0.3]} rotation={[Math.PI / 2, 0, 0]} material={icon}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 6]} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- "not available" tiles drifting apart */
const LOST_COUNT = 9;

export function LostTiles() {
  const story = useStory();
  const g = useRef<THREE.Group>(null);
  const mats = useMemo(
    () =>
      Array.from({ length: LOST_COUNT }, () => new THREE.MeshStandardMaterial({ color: "#7C8DA3", roughness: 0.8, transparent: true })),
    [],
  );
  const xMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#F3F7FB", transparent: true }), []);
  useFrame((state) => {
    const grp = g.current;
    if (!grp) return;
    const t = state.clock.elapsedTime;
    const p = story.lost;
    const show = p > 0.005 && p < 1.001;
    grp.visible = p > 0.005;
    xMat.opacity = Math.min(1, p * 4);
    grp.children.forEach((c, i) => {
      const a = (i / LOST_COUNT) * Math.PI * 2 + 0.5;
      const spread = 0.7 + p * (2.4 + (i % 3) * 0.6);
      c.position.set(
        story.family.x + Math.cos(a) * spread,
        1.7 + Math.sin(a * 1.7) * 0.5 * p + Math.sin(t * 1.3 + i) * 0.05,
        story.family.z + Math.sin(a) * spread * 0.6 - 0.4,
      );
      c.rotation.set(Math.PI / 2 + Math.sin(t + i) * 0.15, 0, a + t * 0.2 * p);
      c.scale.setScalar(Math.min(1, p * 5) * (1 - 0.25 * p));
      mats[i].opacity = show ? 0.95 - 0.45 * p : 0;
    });
  });
  return (
    <group ref={g} visible={false}>
      {mats.map((m, i) => (
        <group key={i}>
          <mesh material={m}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 6]} />
          </mesh>
          {/* a small cross: this one is not available */}
          {[Math.PI / 4, -Math.PI / 4].map((r) => (
            <mesh key={r} position={[0, 0.032, 0]} rotation={[0, r, 0]} material={xMat}>
              <boxGeometry args={[0.2, 0.01, 0.035]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- prescription paper */
export function Prescription() {
  const story = useStory();
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const r = story.rx;
    if (!g.current) return;
    g.current.visible = r.visible > 0.5;
    g.current.position.set(r.x, r.y, r.z);
  });
  return (
    <group ref={g} visible={false} rotation={[-0.3, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.22, 0.01, 0.3]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.008, -0.1]}>
        <boxGeometry args={[0.1, 0.004, 0.025]} />
        <meshBasicMaterial color={C.primary} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- medicine parcel + pipeline stations */
export function Medicine() {
  const story = useStory();
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    const m = story.medicine;
    if (!g.current) return;
    g.current.visible = m.visible > 0.5;
    const hover = story.delivery.carry > 0.5 ? 0 : Math.sin(state.clock.elapsedTime * 3) * 0.04;
    g.current.position.set(m.x, m.y + hover, m.z);
    g.current.rotation.y = state.clock.elapsedTime * (story.delivery.carry > 0.5 ? 0 : 0.8);
  });
  return (
    <group ref={g} visible={false}>
      <mesh>
        <boxGeometry args={[0.32, 0.22, 0.24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <boxGeometry args={[0.33, 0.02, 0.06]} />
        <meshBasicMaterial color={C.accent} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 6]} />
        <meshBasicMaterial color={C.primary} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Small icon props floating above four path cells: prescription, pharmacy, packing, delivery. */
export function Stations() {
  const story = useStory();
  const g = useRef<THREE.Group>(null);
  const xs = [15.7, 13.1, 10.5, 7.9];
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.children.forEach((c, i) => {
      const reveal = Math.min(1, Math.max(0, story.path * 5 - i * 0.9 + 0.3));
      c.visible = reveal > 0.01;
      c.scale.setScalar(Math.max(0.001, reveal));
      c.position.y = 1.0 + Math.sin(t * 2 + i) * 0.05;
      c.rotation.y = t * 0.6 + i;
    });
  });
  const hexMat = <meshBasicMaterial color={C.accent} toneMapped={false} />;
  return (
    <group ref={g}>
      {xs.map((x, i) => (
        <group key={x} position={[x, 1, LAYOUT.pathRow.z + 0.9]} visible={false}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 6]} />
            {hexMat}
          </mesh>
          {i === 0 && (
            <mesh position={[0, 0, 0.05]} rotation={[0.4, 0.5, 0]}>
              <boxGeometry args={[0.14, 0.14, 0.14]} />
              <meshStandardMaterial color="#fff" />
            </mesh>
          )}
          {i === 1 && (
            <group position={[0, 0, 0.04]}>
              <mesh>
                <torusGeometry args={[0.07, 0.016, 8, 18]} />
                <meshStandardMaterial color={C.deep} />
              </mesh>
              <mesh position={[0.07, -0.07, 0]} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.1, 0.022, 0.022]} />
                <meshStandardMaterial color={C.deep} />
              </mesh>
            </group>
          )}
          {i === 2 && (
            <group position={[0, -0.03, 0.05]}>
              {[-0.08, 0.08].map((x) => (
                <mesh key={x} position={[x, 0, 0]}>
                  <boxGeometry args={[0.13, 0.12, 0.12]} />
                  <meshStandardMaterial color="#fff" />
                </mesh>
              ))}
              <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.13, 0.12, 0.12]} />
                <meshStandardMaterial color="#fff" />
              </mesh>
            </group>
          )}
          {i === 3 && (
            <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.08, 0.2, 3]} />
              <meshStandardMaterial color={C.deep} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/** Soft beams over the four lit city tiles. */
export function CityBeams() {
  const story = useStory();
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    g.current?.children.forEach((c, i) => {
      const r = Math.min(1, Math.max(0, story.city[i]));
      c.visible = r > 0.02;
      c.scale.set(1, r, 1);
      c.position.y = 0.6 + r * 1.4 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.03;
    });
  });
  return (
    <group ref={g}>
      {CITY_OFFSETS.map(([x, z], i) => (
        <mesh key={i} position={[LAYOUT.impact.x + x, 2, z]} visible={false}>
          <cylinderGeometry args={[0.05, 0.4, 2.8, 6, 1, true]} />
          <meshBasicMaterial color={C.accent} transparent opacity={0.25} toneMapped={false} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
