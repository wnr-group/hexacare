"use client";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStory } from "../context";
import type { CharState } from "../state";
import { ROLES, type RoleId } from "./roles";
import { storyConfig } from "../story.config";
import ProceduralRig from "./ProceduralRig";
import GltfRig from "./GltfRig";

const availability = new Map<string, Promise<boolean>>();

/** HEAD-checks a model file once so a missing .glb silently falls back to the procedural rig. */
function checkModel(url: string) {
  let p = availability.get(url);
  if (!p) {
    p = fetch(url, { method: "HEAD" })
      .then((r) => r.ok && !(r.headers.get("content-type") ?? "").includes("text/html"))
      .catch(() => false);
    availability.set(url, p);
  }
  return p;
}

class Boundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

let blobTexture: THREE.Texture | null = null;
function getBlob() {
  if (blobTexture) return blobTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  grad.addColorStop(0, "rgba(8,47,73,0.45)");
  grad.addColorStop(1, "rgba(8,47,73,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  blobTexture = new THREE.CanvasTexture(c);
  return blobTexture;
}

interface Props {
  id: "patient" | "expert" | "delivery";
  role: RoleId;
  modelUrl: string;
}

export default function Character({ id, role, modelUrl }: Props) {
  const story = useStory();
  const cs: CharState = story[id];
  const group = useRef<THREE.Group>(null);
  const [hasModel, setHasModel] = useState(false);
  const blob = useMemo(() => getBlob(), []);

  useEffect(() => {
    if (!storyConfig.models.enabled) return;
    let live = true;
    checkModel(modelUrl).then((ok) => live && setHasModel(ok));
    return () => {
      live = false;
    };
  }, [modelUrl]);

  // runs before child rigs so look-at/aim maths sees this frame's transform
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const v = Math.max(0.0001, cs.visible);
    g.visible = cs.visible > 0.001;
    g.position.set(cs.x, cs.y, cs.z);
    g.rotation.y = cs.ry;
    g.scale.setScalar(v);
    g.updateMatrixWorld(true);
  }, -10);

  const procedural = <ProceduralRig cs={cs} role={ROLES[role]} story={story} />;
  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} />
      </mesh>
      {hasModel ? (
        <Boundary fallback={procedural}>
          <Suspense fallback={procedural}>
            <GltfRig url={modelUrl} cs={cs} />
          </Suspense>
        </Boundary>
      ) : (
        procedural
      )}
    </group>
  );
}
