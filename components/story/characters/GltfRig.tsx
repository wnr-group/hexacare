"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { CharState } from "../state";
import { storyConfig } from "../story.config";

const TARGET_HEIGHT = 1.7;
const GRAY = new THREE.Color(storyConfig.brand.colors.sick);

interface Props {
  url: string;
  cs: CharState;
}

/** Rigged .glb character driven by an AnimationMixer; the clip is chosen from the timeline action. */
export default function GltfRig({ url, cs }: Props) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => cloneSkinned(gltf.scene) as THREE.Group, [gltf.scene]);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const current = useRef<THREE.AnimationAction | null>(null);
  const lastKey = useRef("");
  const baseColors = useRef<{ mat: THREE.MeshStandardMaterial; color: THREE.Color }[]>([]);

  // normalise size: feet on the ground, 1.7 m tall; give each mesh its own material for tinting
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const h = box.max.y - box.min.y || 1;
    return TARGET_HEIGHT / h;
  }, [scene]);

  useEffect(() => {
    const list: { mat: THREE.MeshStandardMaterial; color: THREE.Color }[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = false;
      const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
      mesh.material = mat;
      if (mat.color) list.push({ mat, color: mat.color.clone() });
    });
    baseColors.current = list;
    return () => {
      mixer.stopAllAction();
    };
  }, [scene, mixer]);

  const findClip = (action: string) => {
    const names = storyConfig.clipMap[action] ?? [action];
    for (const n of names) {
      const hit = gltf.animations.find((a) => a.name.toLowerCase().includes(n.toLowerCase()));
      if (hit) return hit;
    }
    return (
      gltf.animations.find((a) => a.name.toLowerCase().includes("idle")) ?? gltf.animations[0] ?? null
    );
  };

  useFrame((_, delta) => {
    const key = cs.action === "sitSick" || cs.action === "sitPhone" ? "sickIdle" : cs.action;
    if (key !== lastKey.current) {
      lastKey.current = key;
      const clip = findClip(key);
      if (clip) {
        const next = mixer.clipAction(clip);
        next.reset().fadeIn(0.35).play();
        current.current?.fadeOut(0.35);
        current.current = next;
      }
    }
    mixer.update(Math.min(delta, 0.1));
    // unwell → recovered colour grade
    const k = 0.45 * (1 - cs.tint);
    for (const { mat, color } of baseColors.current) mat.color.copy(color).lerp(GRAY, k);
  });

  return <primitive object={scene} scale={scale} />;
}
