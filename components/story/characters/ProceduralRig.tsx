"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharState, StoryState } from "../state";
import { computePose, emptyPose, POSE_KEYS } from "./poses";
import type { RoleStyle } from "./roles";
import { storyConfig } from "../story.config";

const DOWN = new THREE.Vector3(0, -1, 0);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface Props {
  cs: CharState;
  role: RoleStyle;
  story: StoryState;
}

/** Stylised character built from primitives: used whenever no rigged .glb is available. */
export default function ProceduralRig({ cs, role, story }: Props) {
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const lFore = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const lLeg = useRef<THREE.Group>(null);
  const lShin = useRef<THREE.Group>(null);
  const rLeg = useRef<THREE.Group>(null);
  const rShin = useRef<THREE.Group>(null);
  const talkMouth = useRef<THREE.Mesh>(null);
  const smile = useRef<THREE.Mesh>(null);
  const eyes = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Group>(null);

  const cur = useRef(emptyPose());
  const lookW = useRef(0);
  const aimW = useRef(0);

  const mats = useMemo(() => {
    const m = (color: string, rough = 0.7) => new THREE.MeshStandardMaterial({ color, roughness: rough });
    return {
      skin: m(role.skin, 0.55),
      hair: m(role.hair, 0.8),
      shirt: m(role.shirt),
      pants: m(role.pants),
      shoe: m(role.shoe, 0.5),
      coat: m(role.coat ?? "#fff", 0.6),
      accent: new THREE.MeshStandardMaterial({
        color: storyConfig.brand.colors.accent,
        emissive: storyConfig.brand.colors.accent,
        emissiveIntensity: 1.4,
        toneMapped: false,
      }),
      dark: m("#1b2430", 0.4),
      mouth: m("#7a2b2b", 0.6),
      white: m("#ffffff", 0.4),
      backpack: m(role.backpack ?? "#fff", 0.6),
      cap: m(role.cap ?? "#fff", 0.6),
    };
  }, [role]);

  const tmp = useMemo(
    () => ({
      v: new THREE.Vector3(),
      qA: new THREE.Quaternion(),
      qB: new THREE.Quaternion(),
      e: new THREE.Euler(),
      cSkin: new THREE.Color(),
      cShirt: new THREE.Color(),
      sk0: new THREE.Color(role.skinSick),
      sk1: new THREE.Color(role.skin),
      sh0: new THREE.Color(role.shirtSick),
      sh1: new THREE.Color(role.shirt),
    }),
    [role],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const tgt = computePose(cs.action, t, cs.tint, cs.seated, cs.carry);
    const k = 1 - Math.exp(-dt * 11);
    const c = cur.current;
    for (const key of POSE_KEYS) c[key] += (tgt[key] - c[key]) * k;

    if (!hips.current || !torso.current || !head.current) return;
    hips.current.position.y = 0.95 + c.bodyY;
    torso.current.rotation.x = c.lean;

    // head: look-at blend
    lookW.current += (cs.lookW - lookW.current) * (1 - Math.exp(-dt * 6));
    torso.current.updateWorldMatrix(true, false);
    tmp.v.set(cs.lookX, cs.lookY, cs.lookZ);
    torso.current.worldToLocal(tmp.v);
    const yaw = clamp(Math.atan2(tmp.v.x, tmp.v.z), -1.0, 1.0);
    const dist = Math.hypot(tmp.v.x, tmp.v.z) || 1;
    const pitch = clamp(-Math.atan2(tmp.v.y - 0.74, dist), -0.5, 0.5);
    const w = lookW.current;
    head.current.rotation.set(c.headX * (1 - w * 0.6) + pitch * w, yaw * w, 0);

    // arms / legs
    lArm.current?.rotation.set(c.lSX, 0, c.lSZ);
    lFore.current?.rotation.set(c.lE, 0, 0);
    lLeg.current?.rotation.set(c.lH, 0, 0);
    lShin.current?.rotation.set(c.lK, 0, 0);
    rLeg.current?.rotation.set(c.rH, 0, 0);
    rShin.current?.rotation.set(c.rK, 0, 0);
    rFore.current?.rotation.set(c.rE, 0, 0);
    if (rArm.current) {
      aimW.current += ((cs.action === "point" ? 1 : 0) - aimW.current) * (1 - Math.exp(-dt * 8));
      tmp.qA.setFromEuler(tmp.e.set(c.rSX, 0, c.rSZ));
      if (aimW.current > 0.01) {
        tmp.v.set(cs.aimX, cs.aimY, cs.aimZ);
        torso.current.worldToLocal(tmp.v);
        tmp.v.sub(rArm.current.position).normalize();
        tmp.qB.setFromUnitVectors(DOWN, tmp.v);
        tmp.qA.slerp(tmp.qB, aimW.current);
      }
      rArm.current.quaternion.copy(tmp.qA);
    }

    // face
    const talking = c.talk > 0.35;
    if (talkMouth.current && smile.current) {
      talkMouth.current.visible = talking;
      smile.current.visible = !talking;
      talkMouth.current.scale.y = 0.35 + (0.5 + 0.5 * Math.sin(t * 13 + Math.sin(t * 2.3) * 2)) * 0.9;
      smile.current.scale.y = -(-0.7 + 1.7 * cs.tint);
    }
    if (eyes.current) eyes.current.scale.y = (t + 1.3) % 3.6 < 0.12 ? 0.1 : 1;
    if (cup.current) cup.current.visible = story.cup > 0.5;

    // colour grading (unwell → recovered)
    mats.skin.color.copy(tmp.cSkin.lerpColors(tmp.sk0, tmp.sk1, cs.tint));
    mats.shirt.color.copy(tmp.cShirt.lerpColors(tmp.sh0, tmp.sh1, cs.tint));
  });

  const m = mats;
  return (
    <group scale={role.scale}>
      <group ref={hips} position={[0, 0.95, 0]}>
        {/* legs */}
        {([-1, 1] as const).map((s) => {
          const leg = s === -1 ? rLeg : lLeg;
          const shin = s === -1 ? rShin : lShin;
          return (
            <group key={s} ref={leg} position={[s * 0.09, 0, 0]}>
              <mesh position={[0, -0.225, 0]} material={m.pants}>
                <capsuleGeometry args={[0.065, 0.32, 4, 10]} />
              </mesh>
              <group ref={shin} position={[0, -0.45, 0]}>
                <mesh position={[0, -0.225, 0]} material={m.pants}>
                  <capsuleGeometry args={[0.055, 0.32, 4, 10]} />
                </mesh>
                <mesh position={[0, -0.47, 0.05]} material={m.shoe}>
                  <boxGeometry args={[0.09, 0.07, 0.2]} />
                </mesh>
              </group>
            </group>
          );
        })}

        {/* coat skirt */}
        {role.coat && (
          <mesh position={[0, -0.18, 0]} material={m.coat}>
            <cylinderGeometry args={[0.19, 0.25, 0.42, 14, 1, true]} />
          </mesh>
        )}

        <group ref={torso}>
          <mesh position={[0, 0.3, 0]} scale={[1, 1, 0.66]} material={m.shirt}>
            <capsuleGeometry args={[0.17, 0.3, 6, 14]} />
          </mesh>
          {role.coat && (
            <>
              <mesh position={[0, 0.28, 0]} scale={[1, 1, 0.72]} material={m.coat}>
                <capsuleGeometry args={[0.19, 0.3, 6, 14]} />
              </mesh>
              <mesh position={[-0.09, 0.42, 0.14]} rotation={[Math.PI / 2, 0, 0]} material={m.accent}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 6]} />
              </mesh>
            </>
          )}
          {role.backpack && (
            <mesh position={[0, 0.3, -0.2]} material={m.backpack}>
              <boxGeometry args={[0.32, 0.38, 0.18]} />
            </mesh>
          )}

          {/* arms */}
          {([-1, 1] as const).map((s) => {
            const arm = s === -1 ? rArm : lArm;
            const fore = s === -1 ? rFore : lFore;
            return (
              <group key={s} ref={arm} position={[s * 0.22, 0.48, 0]}>
                <mesh position={[0, -0.15, 0]} material={role.coat ? m.coat : m.shirt}>
                  <capsuleGeometry args={[0.05, 0.2, 4, 10]} />
                </mesh>
                <group ref={fore} position={[0, -0.3, 0]}>
                  <mesh position={[0, -0.14, 0]} material={role.coat ? m.coat : m.shirt}>
                    <capsuleGeometry args={[0.042, 0.2, 4, 10]} />
                  </mesh>
                  <mesh position={[0, -0.31, 0]} material={m.skin}>
                    <sphereGeometry args={[0.048, 12, 10]} />
                  </mesh>
                  {s === -1 && (
                    <group ref={cup} position={[0, -0.34, 0.06]} visible={false}>
                      <mesh material={m.white}>
                        <cylinderGeometry args={[0.035, 0.03, 0.09, 12]} />
                      </mesh>
                    </group>
                  )}
                </group>
              </group>
            );
          })}

          {/* head */}
          <group ref={head} position={[0, 0.6, 0]}>
            <mesh position={[0, 0.04, 0]} material={m.skin}>
              <cylinderGeometry args={[0.045, 0.05, 0.1, 10]} />
            </mesh>
            <mesh position={[0, 0.15, 0]} scale={[1, 1.08, 1]} material={m.skin}>
              <sphereGeometry args={[0.122, 24, 18]} />
            </mesh>
            <mesh position={[0, 0.17, -0.012]} rotation={[-0.45, 0, 0]} material={m.hair}>
              <sphereGeometry args={[0.13, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            </mesh>
            {role.longHair && (
              <mesh position={[0, 0.13, -0.09]} scale={[1, 1.2, 0.7]} material={m.hair}>
                <sphereGeometry args={[0.11, 16, 12]} />
              </mesh>
            )}
            {role.cap && (
              <group>
                <mesh position={[0, 0.2, 0]} material={m.cap}>
                  <sphereGeometry args={[0.132, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                </mesh>
                <mesh position={[0, 0.2, 0.12]} rotation={[0.1, 0, 0]} material={m.cap}>
                  <boxGeometry args={[0.16, 0.012, 0.1]} />
                </mesh>
              </group>
            )}
            <group ref={eyes} position={[0, 0.17, 0.108]}>
              {([-1, 1] as const).map((s) => (
                <mesh key={s} position={[s * 0.045, 0, 0]} material={m.dark}>
                  <sphereGeometry args={[0.014, 10, 8]} />
                </mesh>
              ))}
            </group>
            <mesh ref={smile} position={[0, 0.105, 0.113]} material={m.dark}>
              <torusGeometry args={[0.03, 0.005, 6, 14, Math.PI]} />
            </mesh>
            <mesh ref={talkMouth} position={[0, 0.1, 0.115]} scale={[1, 0.4, 0.4]} material={m.mouth} visible={false}>
              <sphereGeometry args={[0.022, 10, 8]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
