"use client";
/* R3F frame loops intentionally mutate three.js objects and the shared story state every frame. */
/* eslint-disable react-hooks/immutability */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useStory } from "./context";
import { LAYOUT, wallCellPos } from "./state";
import { storyConfig } from "./story.config";

const C = storyConfig.brand.colors;
const col = (h: string) => new THREE.Color(h);
const lerp3 = (out: THREE.Color, a: THREE.Color, b: THREE.Color, c: THREE.Color, g: number) =>
  g < 0.55 ? out.lerpColors(a, b, g / 0.55) : out.lerpColors(b, c, (g - 0.55) / 0.45);

function Rim({ color, offset }: { color: string; offset: [number, number, number] }) {
  const story = useStory();
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    l.position.set(story.cam.tx + offset[0], offset[1], story.cam.tz + offset[2]);
    target.position.set(story.cam.tx, 1.2, story.cam.tz);
    target.updateMatrixWorld();
    l.intensity = 1.1 + 1.2 * story.grade;
  });
  return (
    <>
      <directionalLight ref={light} color={color} target={target} intensity={1.5} />
      <primitive object={target} />
    </>
  );
}

export function Environment({ lowPower }: { lowPower: boolean }) {
  const story = useStory();
  const scene = useThree((s) => s.scene);
  const logo = useTexture(storyConfig.brand.logo);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const shadows = useRef<THREE.Group>(null);
  const wallMat = useRef<THREE.MeshStandardMaterial>(null);
  const sofaMat = useRef<THREE.MeshStandardMaterial>(null);
  const windowMat = useRef<THREE.MeshBasicMaterial>(null);
  const lampMat = useRef<THREE.MeshBasicMaterial>(null);
  const backdropMat = useRef<THREE.MeshStandardMaterial>(null);
  const logoMat = useRef<THREE.MeshBasicMaterial>(null);
  const logoMesh = useRef<THREE.Mesh>(null);
  const bulbs = useRef<THREE.MeshBasicMaterial>(null);

  const k = useMemo(
    () => ({
      c: new THREE.Color(),
      bgCold: col("#4C5D70"),
      bgMid: col("#A8D8F3"),
      bgWarm: col("#E2F3FF"),
      bgIntro: col("#04121F"),
      wallCold: col("#6E8196"),
      wallMid: col("#BFD9EA"),
      wallWarm: col("#FFF3E0"),
      sofaCold: col("#56677B"),
      sofaWarm: col("#2F8FC4"),
      winCold: col("#8EA5BA"),
      winWarm: col("#FFE8B0"),
      bdCold: col("#1A3248"),
      bdWarm: col("#0B4F7D"),
      keyCold: col("#B9CCE0"),
      keyWarm: col("#FFF1D6"),
    }),
    [],
  );

  const [wx, wy, wz] = wallCellPos(-1);

  useFrame((state) => {
    const g = story.grade;
    const t = state.clock.elapsedTime;
    // sky + fog
    lerp3(k.c, k.bgCold, k.bgMid, k.bgWarm, g).lerp(k.bgIntro, story.intro);
    if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color();
    scene.background.copy(k.c);
    if (!scene.fog) scene.fog = new THREE.Fog(k.c, 22, 60);
    (scene.fog as THREE.Fog).color.copy(k.c);

    if (keyRef.current) {
      keyRef.current.color.lerpColors(k.keyCold, k.keyWarm, g);
      keyRef.current.intensity = (0.8 + 1.5 * g) * (1 - 0.7 * story.intro);
      keyRef.current.position.set(story.cam.tx + 3, 7, story.cam.tz + 6);
      keyRef.current.target.position.set(story.cam.tx, 0, story.cam.tz);
      keyRef.current.target.updateMatrixWorld();
    }
    if (hemi.current) hemi.current.intensity = (0.55 + 0.7 * g) * (1 - 0.4 * story.intro) + 0.3 * story.intro;
    if (shadows.current) shadows.current.position.set(story.cam.tx, 0.03, story.cam.tz * 0.3);

    wallMat.current?.color.copy(lerp3(k.c, k.wallCold, k.wallMid, k.wallWarm, g));
    sofaMat.current?.color.lerpColors(k.sofaCold, k.sofaWarm, g);
    windowMat.current?.color.lerpColors(k.winCold, k.winWarm, g).multiplyScalar(1 + g * 0.8);
    lampMat.current?.color.setRGB(1, 0.85, 0.55).multiplyScalar(0.15 + g * 2.2);
    backdropMat.current?.color.lerpColors(k.bdCold, k.bdWarm, g);
    bulbs.current?.color.setRGB(1, 0.9, 0.6).multiplyScalar(0.4 + g * 2.0);

    if (logoMat.current && logoMesh.current) {
      const o = Math.min(1, story.honey * 1.2);
      logoMat.current.opacity = o;
      const sc = 1.55 + 0.45 * story.finale + 0.03 * Math.sin(t * 2);
      logoMesh.current.scale.setScalar(sc * (0.6 + 0.4 * o));
      logoMesh.current.visible = o > 0.01;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#DDF0FF", "#6B7F94", 1]} />
      <directionalLight ref={keyRef} />
      <Rim color={C.accent} offset={[-5, 4, -5]} />
      <Rim color="#FFC27A" offset={[5, 3.5, -5]} />

      <group ref={shadows}>
        <ContactShadows
          position={[0, 0, 0]}
          scale={18}
          far={2.6}
          blur={2.6}
          opacity={0.45}
          resolution={lowPower ? 256 : 512}
          frames={Infinity}
          color="#082F49"
        />
      </group>

      {/* ------------------------------------------------ home */}
      <group>
        <mesh position={[-0.2, 1.7, -3.05]}>
          <boxGeometry args={[9, 3.4, 0.15]} />
          <meshStandardMaterial ref={wallMat} roughness={0.9} />
        </mesh>
        <mesh position={[4.2, 1.7, -0.8]}>
          <boxGeometry args={[0.15, 3.4, 4.4]} />
          <meshStandardMaterial color="#cfd9e3" roughness={0.9} />
        </mesh>
        <mesh position={[4.2, 3.0, LAYOUT.door.z]}>
          <boxGeometry args={[0.15, 0.8, 1.9]} />
          <meshStandardMaterial color="#cfd9e3" roughness={0.9} />
        </mesh>
        <mesh position={[1.8, 1.9, -2.96]}>
          <planeGeometry args={[1.8, 1.4]} />
          <meshBasicMaterial ref={windowMat} toneMapped={false} />
        </mesh>
        {/* sofa */}
        <group position={[LAYOUT.sofa.x, 0, LAYOUT.sofa.z]}>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[2.1, 0.4, 0.9]} />
            <meshStandardMaterial ref={sofaMat} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.43, 0.02]}>
            <boxGeometry args={[1.8, 0.07, 0.8]} />
            <meshStandardMaterial color="#8da2b6" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.78, -0.4]}>
            <boxGeometry args={[2.1, 0.7, 0.18]} />
            <meshStandardMaterial color="#6f8297" roughness={0.9} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.0, 0.4, 0]}>
              <boxGeometry args={[0.18, 0.5, 0.9]} />
              <meshStandardMaterial color="#6f8297" roughness={0.9} />
            </mesh>
          ))}
        </group>
        <mesh position={[-0.2, 0.02, -0.4]}>
          <cylinderGeometry args={[1.5, 1.5, 0.03, 6]} />
          <meshStandardMaterial color={C.primary} roughness={1} transparent opacity={0.45} />
        </mesh>
        {/* lamp */}
        <group position={[-3.3, 0, -2.4]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.6, 8]} />
            <meshStandardMaterial color="#44566c" />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <sphereGeometry args={[0.28, 16, 12]} />
            <meshBasicMaterial ref={lampMat} toneMapped={false} />
          </mesh>
        </group>
        {/* plant */}
        <group position={[3.2, 0, -2.5]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.22, 0.17, 0.5, 8]} />
            <meshStandardMaterial color="#c4875a" />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[Math.sin(i * 2.1) * 0.12, 0.75 + i * 0.12, Math.cos(i * 2.1) * 0.12]}>
              <sphereGeometry args={[0.24 - i * 0.04, 12, 10]} />
              <meshStandardMaterial color="#4FA06A" roughness={0.8} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ------------------------------------------------ street lamps */}
      {[6, 10].map((x) => (
        <group key={x} position={[x, 0, 0.2]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 2.4, 8]} />
            <meshStandardMaterial color="#44566c" />
          </mesh>
          <mesh position={[0, 2.45, 0]}>
            <sphereGeometry args={[0.13, 12, 10]} />
            <meshBasicMaterial ref={x === 6 ? bulbs : undefined} color="#ffe9a8" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ------------------------------------------------ branch backdrop + logo */}
      <mesh position={[16, 3.6, -3.1]}>
        <boxGeometry args={[15, 7.4, 0.2]} />
        <meshStandardMaterial ref={backdropMat} roughness={0.7} />
      </mesh>
      <mesh ref={logoMesh} position={[wx, wy, wz + 0.22]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={logoMat} map={logo} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}

export default Environment;
