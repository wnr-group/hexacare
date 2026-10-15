'use client'
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ---------- 1. Shared Three.js Mount Hook ---------- */
interface ThreeSceneAPI {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: HTMLDivElement;
  prefersReduced: boolean;
  onCleanup: (fn: () => void) => void;
}

type ThreeSceneSetup = (api: ThreeSceneAPI) => (() => void) | void;

export function useThreeScene(setupFn: ThreeSceneSetup): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const cleanupFns: Array<() => void> = [];
    const animateFn = setupFn({
      scene,
      camera,
      renderer,
      container,
      prefersReduced,
      onCleanup: (fn) => cleanupFns.push(fn),
    });

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (animateFn) animateFn();
      renderer.render(scene, camera);
    };
    loop();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cleanupFns.forEach((fn) => fn());
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // setupFn is read once on mount; callers pass inline functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return containerRef;
}

/* ---------- 2. Three.js Components ---------- */
export function CapsuleScene() {
  const ref = useThreeScene(({ scene, camera, prefersReduced }) => {
    camera.position.set(0, 0, 11);

    const brandBlue = new THREE.Color("#0284C7");
    const cyan = new THREE.Color("#22D3EE");
    const white = new THREE.Color("#ffffff");
    const granuleColors = [brandBlue, cyan, white, new THREE.Color("#0EA5E9")];

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);
    const capsuleGroup = new THREE.Group();
    sceneGroup.add(capsuleGroup);

    const upperMat = new THREE.MeshPhysicalMaterial({ color: cyan, transparent: true, opacity: 0.65, transmission: 0.55, thickness: 0.5, roughness: 0.12, metalness: 0.1, clearcoat: 1, ior: 1.4 });
    const lowerMat = new THREE.MeshStandardMaterial({ color: brandBlue, roughness: 0.25, metalness: 0.35 });

    const createHalf = (material: THREE.Material, isUpper: boolean) => {
      const group = new THREE.Group();
      const bodyGeom = new THREE.CylinderGeometry(1, 1, 1.4, 32, 1, false);
      const body = new THREE.Mesh(bodyGeom, material);
      body.position.y = isUpper ? 0.7 : -0.7;
      group.add(body);
      const capGeom = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const cap = new THREE.Mesh(capGeom, material);
      cap.position.y = isUpper ? 1.4 : -1.4;
      if (!isUpper) cap.rotation.x = Math.PI;
      group.add(cap);
      return group;
    };

    const upperHalf = createHalf(upperMat, true);
    const lowerHalf = createHalf(lowerMat, false);
    capsuleGroup.add(upperHalf);
    capsuleGroup.add(lowerHalf);

    const particleCount = 120;
    const particleGeom = new THREE.SphereGeometry(0.075, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1, vertexColors: true });
    const instancedParticles = new THREE.InstancedMesh(particleGeom, particleMat, particleCount);
    const particlesData: { pos: THREE.Vector3, rot: THREE.Euler, scale: number }[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < particleCount; i++) {
      const data = {
        pos: new THREE.Vector3((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 1.4),
        rot: new THREE.Euler(Math.random(), Math.random(), Math.random()),
        scale: 0.5 + Math.random() * 0.5,
      };
      particlesData.push(data);
      dummy.position.copy(data.pos);
      dummy.rotation.copy(data.rot);
      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
      instancedParticles.setColorAt(i, granuleColors[Math.floor(Math.random() * granuleColors.length)]);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;
    if (instancedParticles.instanceColor) instancedParticles.instanceColor.needsUpdate = true;
    capsuleGroup.add(instancedParticles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const brandLight = new THREE.DirectionalLight(brandBlue, 1.4);
    brandLight.position.set(5, 5, 5);
    scene.add(brandLight);
    const fillLight = new THREE.DirectionalLight(white, 0.7);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);

    const cycleDuration = 6000;

    return () => {
      if (prefersReduced) return;
      const time = Date.now();
      const elapsed = time % cycleDuration;
      const progress = elapsed / cycleDuration;

      sceneGroup.rotation.y += 0.005;
      sceneGroup.position.y = Math.sin(time * 0.001) * 0.15;

      let separation = 0;
      let particleExpansion = 0;
      if (progress < 0.33) { separation = 0; }
      else if (progress < 0.5) { separation = Math.sin(((progress - 0.33) / 0.17 * Math.PI) / 2) * 2.2; }
      else if (progress < 0.83) { separation = 2.2; particleExpansion = (progress - 0.5) / 0.33; }
      else { const p = (progress - 0.83) / 0.17; separation = (1 - p) * 2.2; particleExpansion = 1 - p; }

      upperHalf.position.y = separation;
      lowerHalf.position.y = -separation;

      for (let i = 0; i < particleCount; i++) {
        const data = particlesData[i];
        if (particleExpansion > 0) {
          const dir = data.pos.clone().normalize();
          const currentPos = data.pos.clone().add(dir.multiplyScalar(particleExpansion * 4.5));
          currentPos.y -= Math.pow(particleExpansion, 2) * 1.8;
          dummy.position.copy(currentPos);
          dummy.scale.setScalar(data.scale * (1 - particleExpansion * 0.5));
        } else {
          dummy.position.copy(data.pos);
          dummy.scale.setScalar(data.scale);
        }
        dummy.rotation.set(data.rot.x + time * 0.001, data.rot.y + time * 0.001, data.rot.z);
        dummy.updateMatrix();
        instancedParticles.setMatrixAt(i, dummy.matrix);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;
      instancedParticles.visible = progress > 0.35 && progress < 0.95;
    };
  });
  return <div ref={ref} className="w-full h-full" />;
}

export function MoleculeSatellites() {
  const ref = useThreeScene(({ scene, camera, prefersReduced }) => {
    camera.position.z = 11;
    const group = new THREE.Group();
    scene.add(group);

    const brandBlue = new THREE.Color("#0284C7");
    const cyan = new THREE.Color("#22D3EE");
    const white = new THREE.Color("#ffffff");

    const coreGeom = new THREE.IcosahedronGeometry(1.1, 1);
    const coreMat = new THREE.MeshPhongMaterial({ color: brandBlue, emissive: brandBlue, emissiveIntensity: 0.5, shininess: 100, transparent: true, opacity: 0.92 });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    const satelliteCount = 6;
    for (let i = 0; i < satelliteCount; i++) {
      const angle = (i / satelliteCount) * Math.PI * 2;
      const radius = 2.4;
      const sGeom = new THREE.SphereGeometry(0.36, 32, 32);
      const sMat = new THREE.MeshPhongMaterial({ color: cyan, emissive: cyan, emissiveIntensity: 0.55 });
      const satellite = new THREE.Mesh(sGeom, sMat);
      satellite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
      group.add(satellite);

      const bondGeom = new THREE.CylinderGeometry(0.07, 0.07, radius, 8);
      const bondMat = new THREE.MeshPhongMaterial({ color: white, transparent: true, opacity: 0.3 });
      const bond = new THREE.Mesh(bondGeom, bondMat);
      bond.position.set(Math.cos(angle) * radius * 0.5, Math.sin(angle) * radius * 0.5, 0);
      bond.rotation.z = angle + Math.PI / 2;
      group.add(bond);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const pulseLight = new THREE.PointLight(brandBlue, 2, 12);
    scene.add(pulseLight);

    return () => {
      if (prefersReduced) return;
      const time = Date.now() * 0.001;
      group.rotation.y += 0.005;
      group.rotation.x = Math.sin(time * 0.5) * 0.2;
      pulseLight.intensity = 1.4 + Math.sin(time * 3) * 0.5;
    };
  });
  return <div ref={ref} className="w-full h-full" />;
}
