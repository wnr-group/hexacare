"use client";
/* R3F frame loops intentionally mutate three.js objects and the shared story state every frame. */
/* eslint-disable react-hooks/immutability */
import { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import * as THREE from "three";
import { StoryContext } from "./context";
import type { StoryState } from "./state";
import { storyConfig } from "./story.config";
import Environment from "./Environment";
import HexCell from "./HexCell";
import Patient from "./characters/Patient";
import HexacareExpert from "./characters/HexacareExpert";
import Family from "./characters/Family";
import Doctor from "./characters/Doctor";
import DeliveryPartner from "./characters/DeliveryPartner";
import { CityBeams, IntroStage, LostTiles, Medicine, PainCloud, Prescription, Stations } from "./Props";
import { useStory } from "./context";

/** Reads the camera block the GSAP timeline writes; adds portrait pull-back and a gentle handheld drift. */
function CameraRig() {
  const story = useStory();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3() }), []);
  useFrame(({ camera, size, clock }) => {
    const c = story.cam;
    const aspect = size.width / size.height;
    const pull = aspect < 1.3 ? 1 + (1.3 - aspect) * 0.9 : 1;
    const time = clock.elapsedTime;
    tmp.t.set(c.tx, c.ty, c.tz);
    tmp.p.set(c.px, c.py, c.pz).sub(tmp.t).multiplyScalar(pull).add(tmp.t);
    tmp.p.x += Math.sin(time * 0.4) * 0.05;
    tmp.p.y += Math.sin(time * 0.5) * 0.03;
    camera.position.copy(tmp.p);
    camera.lookAt(tmp.t);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = c.fov;
    // lift the scene so characters never sit behind the caption strip
    const shift = size.height * (aspect < 1 ? 0.1 : 0.07);
    cam.setViewOffset(size.width, size.height, 0, shift, size.width, size.height);
    cam.updateProjectionMatrix();
  }, -20);
  return null;
}

interface SceneProps {
  story: StoryState;
  active: boolean;
  lowPower: boolean;
  onReady: () => void;
}

export default function Scene({ story, active, lowPower, onReady }: SceneProps) {
  const count = lowPower ? storyConfig.particles.mobile : storyConfig.particles.desktop;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, lowPower ? 1.5 : 1.75]}
      camera={{ fov: 38, near: 0.1, far: 120, position: [0, 31, 7] }}
      gl={{ antialias: lowPower, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        onReady();
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <StoryContext.Provider value={story}>
        <CameraRig />
        <Suspense fallback={null}>
          <Environment lowPower={lowPower} />
          <HexCell />
          <IntroStage count={count} />
          <Stations />
          <CityBeams />
          <PainCloud />
          <LostTiles />
          <Prescription />
          <Medicine />
          <Patient />
          <Family />
          <Doctor />
          <HexacareExpert />
          <DeliveryPartner />
        </Suspense>
        {!lowPower && (
          <EffectComposer multisampling={4}>
            <Bloom intensity={0.7} luminanceThreshold={1} luminanceSmoothing={0.2} mipmapBlur />
            <ToneMapping />
          </EffectComposer>
        )}
      </StoryContext.Provider>
    </Canvas>
  );
}
