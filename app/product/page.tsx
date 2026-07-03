'use client'
import React, { useEffect, useRef, useState, type ReactNode, type ComponentType } from "react";
import * as THREE from "three";
import type { LucideProps } from "lucide-react";
import {
  FlaskConical,
  BrainCog,
  ShieldCheck,
  Activity,
  Beaker,
  LineChart,
  Check,
  Search,
  TestTube2,
  ClipboardList,
  Pill,
  ArrowRight,
  ArrowUpRight,
  Radio,
} from "lucide-react";

/* ---------------------------------------------------------
   LUMINA BIOWORKS — Products page (single-page, no nav/footer)
   Palette matches homepage:
   sky mist #EAF6FF · primary #0284C7 · deep navy #082F49
   cyan glow #22D3EE · ink #0B2545 · slate #4B6584
   Display: Space Grotesk · Body: Inter · Data: JetBrains Mono
--------------------------------------------------------- */

type IconType = ComponentType<LucideProps>;

/* ---------- shared three.js mount hook ---------- */
interface ThreeSceneAPI {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: HTMLDivElement;
  prefersReduced: boolean;
  onCleanup: (fn: () => void) => void;
}

type ThreeSceneSetup = (api: ThreeSceneAPI) => (() => void) | void;

function useThreeScene(setupFn: ThreeSceneSetup): React.RefObject<HTMLDivElement> {
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
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setupFn]);

  return containerRef;
}

/* ---------- reveal-on-scroll wrapper ---------- */
interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- 1. Capsule breach hero animation ---------- */
interface ParticleData {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  scale: number;
}

function CapsuleScene() {
  const ref = useThreeScene(({ scene, camera }) => {
    camera.position.set(0, 0, 11);

    const brandBlue = new THREE.Color("#0284C7");
    const cyan = new THREE.Color("#22D3EE");
    const white = new THREE.Color("#ffffff");
    const granuleColors = [brandBlue, cyan, white, new THREE.Color("#0EA5E9")];

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);
    const capsuleGroup = new THREE.Group();
    sceneGroup.add(capsuleGroup);

    const upperMat = new THREE.MeshPhysicalMaterial({
      color: cyan,
      transparent: true,
      opacity: 0.65,
      transmission: 0.55,
      thickness: 0.5,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1,
      ior: 1.4,
    });
    const lowerMat = new THREE.MeshStandardMaterial({
      color: brandBlue,
      roughness: 0.25,
      metalness: 0.35,
    });

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
    const particleMat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.1,
      vertexColors: true,
    });
    const instancedParticles = new THREE.InstancedMesh(particleGeom, particleMat, particleCount);
    const particlesData: ParticleData[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < particleCount; i++) {
      const data: ParticleData = {
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 1.4
        ),
        rot: new THREE.Euler(Math.random(), Math.random(), Math.random()),
        scale: 0.5 + Math.random() * 0.5,
      };
      particlesData.push(data);
      dummy.position.copy(data.pos);
      dummy.rotation.copy(data.rot);
      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
      instancedParticles.setColorAt(
        i,
        granuleColors[Math.floor(Math.random() * granuleColors.length)]
      );
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
      const time = Date.now();
      const elapsed = time % cycleDuration;
      const progress = elapsed / cycleDuration;

      sceneGroup.rotation.y += 0.005;
      sceneGroup.position.y = Math.sin(time * 0.001) * 0.15;

      let separation = 0;
      let particleExpansion = 0;
      if (progress < 0.33) {
        separation = 0;
      } else if (progress < 0.5) {
        const p = (progress - 0.33) / 0.17;
        separation = Math.sin((p * Math.PI) / 2) * 2.2;
      } else if (progress < 0.83) {
        separation = 2.2;
        particleExpansion = (progress - 0.5) / 0.33;
      } else {
        const p = (progress - 0.83) / 0.17;
        separation = (1 - p) * 2.2;
        particleExpansion = 1 - p;
      }

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

/* ---------- 2. Molecular satellite scene ---------- */
function MoleculeSatellites() {
  const ref = useThreeScene(({ scene, camera }) => {
    camera.position.z = 11;

    const group = new THREE.Group();
    scene.add(group);

    const brandBlue = new THREE.Color("#0284C7");
    const cyan = new THREE.Color("#22D3EE");
    const white = new THREE.Color("#ffffff");

    const coreGeom = new THREE.IcosahedronGeometry(1.1, 1);
    const coreMat = new THREE.MeshPhongMaterial({
      color: brandBlue,
      emissive: brandBlue,
      emissiveIntensity: 0.5,
      shininess: 100,
      transparent: true,
      opacity: 0.92,
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    const satelliteCount = 6;
    for (let i = 0; i < satelliteCount; i++) {
      const angle = (i / satelliteCount) * Math.PI * 2;
      const radius = 2.4;

      const sGeom = new THREE.SphereGeometry(0.36, 32, 32);
      const sMat = new THREE.MeshPhongMaterial({
        color: cyan,
        emissive: cyan,
        emissiveIntensity: 0.55,
      });
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
      const time = Date.now() * 0.001;
      group.rotation.y += 0.005;
      group.rotation.x = Math.sin(time * 0.5) * 0.2;
      pulseLight.intensity = 1.4 + Math.sin(time * 3) * 0.5;
    };
  });

  return <div ref={ref} className="w-full h-full" />;
}

/* ---------- data ---------- */
interface Feature {
  icon: IconType;
  title: string;
  desc: string;
}

const features: Feature[] = [
  {
    icon: FlaskConical,
    title: "Molecular Diagnostics",
    desc: "High-throughput screening for early-stage pathology detection and personalized therapy planning.",
  },
  {
    icon: BrainCog,
    title: "AI Analysis",
    desc: "Machine learning models trained on petabytes of clinical data to predict treatment efficacy.",
  },
  {
    icon: ShieldCheck,
    title: "HIPAA Security",
    desc: "Enterprise-grade encryption and decentralized data governance protecting patient privacy.",
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    desc: "Continuous vital tracking paired with predictive alerts for proactive patient care.",
  },
  {
    icon: Beaker,
    title: "Drug Delivery",
    desc: "Micro-encapsulation technology for targeted release and improved bioavailability.",
  },
  {
    icon: LineChart,
    title: "Predictive Analytics",
    desc: "Forecasting patient outcomes and capacity needs with 14-day leading-indicator accuracy.",
  },
];

const checklist: string[] = [
  "Hexameric Protein Assembly",
  "Cryo-EM Validation Workflow",
  "Adaptive Nano-Dosing Protocols",
];

type ProductStatus = "Approved" | "In Trial" | "New Release";

interface Product {
  name: string;
  category: string;
  indication: string;
  dosage: string;
  status: ProductStatus;
  price: string;
}

const products: Product[] = [
  {
    name: "LuminaZyn 500",
    category: "Immuno-Therapy",
    indication: "Chronic Inflammation",
    dosage: "500mg/day",
    status: "Approved",
    price: "$499.00",
  },
  {
    name: "NeuroAdapt-X",
    category: "Neurology",
    indication: "Cognitive Fatigue",
    dosage: "100mg/daily",
    status: "In Trial",
    price: "$285.00",
  },
  {
    name: "CardioFlow Max",
    category: "Cardiovascular",
    indication: "Hypertension",
    dosage: "25ml Vial",
    status: "Approved",
    price: "$340.00",
  },
  {
    name: "GlycoStabil-8",
    category: "Endocrinology",
    indication: "Insulin Sensitivity",
    dosage: "8mg Caps",
    status: "New Release",
    price: "$195.00",
  },
  {
    name: "ViraShield IV",
    category: "Antiviral",
    indication: "Immune Deficit",
    dosage: "1000iu Infusion",
    status: "Approved",
    price: "$1,120.00",
  },
];

const statusStyles: Record<ProductStatus, string> = {
  Approved: "bg-emerald-100 text-emerald-700",
  "In Trial": "bg-amber-100 text-amber-700",
  "New Release": "bg-sky-100 text-sky-700",
};

interface ProcessStep {
  icon: IconType;
  step: string;
  title: string;
  desc: string;
}

const processSteps: ProcessStep[] = [
  {
    icon: Search,
    step: "01",
    title: "Discovery",
    desc: "Target identification via high-resolution genomic sequencing.",
  },
  {
    icon: TestTube2,
    step: "02",
    title: "Development",
    desc: "In-silico molecular modeling and candidate synthesis.",
  },
  {
    icon: ClipboardList,
    step: "03",
    title: "Clinical Trials",
    desc: "Phase I–III human safety and efficacy testing.",
  },
  {
    icon: Pill,
    step: "04",
    title: "Market Delivery",
    desc: "Global distribution with continuous post-market monitoring.",
  },
];

/* ---------- shared UI atoms ---------- */
interface IconBadgeProps {
  Icon: IconType;
  tone?: "light" | "dark";
}

function IconBadge({ Icon, tone = "light" }: IconBadgeProps) {
  return (
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
        tone === "dark"
          ? "bg-white/15 text-white"
          : "bg-[#0284C7]/10 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white"
      }`}
    >
      <Icon size={22} strokeWidth={1.8} />
    </div>
  );
}

export default function ProductPage() {
  return (
    <div
      className="min-h-screen w-full bg-[#EAF6FF] text-[#0B2545] overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel { background: rgba(255,255,255,0.62); backdrop-filter: blur(16px); border: 1px solid rgba(2,132,199,0.12); }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="relative px-6 sm:px-10 lg:px-16 pt-16 pb-16 sm:pt-20 lg:pt-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-[70%] h-full bg-[#0284C7]/8 blur-[140px] -z-10 rounded-full" />
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="flex flex-col gap-6">
              <span className="font-mono text-[11px] tracking-[0.25em] text-[#0284C7] uppercase font-medium bg-[#0284C7]/10 px-4 py-2 rounded-full w-fit">
                Next-Gen Healthcare Tech
              </span>
              <h1 className="font-display font-bold text-[34px] sm:text-[44px] lg:text-[52px] leading-[1.08] text-[#082F49] tracking-tight">
                Precision care powered by science
              </h1>
              <p className="text-base sm:text-lg text-[#4B6584] leading-relaxed max-w-xl">
                Integrating molecular-level precision with advanced AI to
                deliver personalized biopharmaceutical solutions for global
                healthcare providers.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <button className="bg-[#0284C7] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#075985] transition-all shadow-lg shadow-[#0284C7]/20 active:scale-95 flex items-center gap-2">
                  Our Solutions <ArrowRight size={18} />
                </button>
                <button className="border border-[#0284C7]/25 text-[#082F49] px-8 py-4 rounded-full font-semibold hover:bg-white/70 transition-all active:scale-95">
                  Clinical Trials
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6 sm:gap-8 mt-8 border-t border-[#0284C7]/15 pt-8">
                {[
                  ["98.6%", "Accuracy"],
                  ["150K+", "Patients"],
                  ["40+", "Countries"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-display font-bold text-xl sm:text-2xl text-[#0284C7]">
                      {val}
                    </div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-widest text-[#4B6584] mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
              <div className="absolute -inset-4 bg-[#0284C7]/10 rounded-full blur-3xl opacity-60" />
              <div className="relative w-full h-full bg-white/40 rounded-[2rem] border border-[#0284C7]/15 overflow-hidden shadow-2xl">
                <CapsuleScene />
                <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 glass-panel p-4 rounded-2xl shadow-lg max-w-[190px]">
                  <p className="font-mono text-[10px] tracking-widest text-[#0284C7] mb-1">
                    REAL-TIME DATA
                  </p>
                  <p className="text-sm font-semibold text-[#082F49] leading-snug">
                    Monitoring molecular synthesis in 14ms
                  </p>
                </div>
                <div className="absolute top-5 left-5 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#0284C7]">
                  <Radio size={12} className="animate-pulse" />
                  LIVE SIMULATION
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-white/50 border-y border-[#0284C7]/10">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center mb-14 sm:mb-20">
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-medium block mb-4">
              Why Lumina
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#082F49]">
              Built for clinical excellence
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="group h-full bg-white p-7 sm:p-8 rounded-2xl border border-[#0284C7]/10 border-b-4 border-b-[#0284C7] shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:shadow-[#0284C7]/10 transition-all duration-500">
                  <IconBadge Icon={Icon} />
                  <h3 className="font-display font-bold text-lg text-[#082F49] mt-6 mb-2.5">
                    {title}
                  </h3>
                  <p className="text-[#4B6584] text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MOLECULAR ENGINEERING ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none rounded-[2.5rem] overflow-hidden border-4 sm:border-8 border-white shadow-2xl bg-[#082F49]">
              <MoleculeSatellites />
              <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
                <div className="px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <span className="text-white font-mono text-[10px] tracking-widest">
                    STRUCTURAL ANALYSIS ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={150}>
            <div className="flex flex-col gap-5">
              <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-medium">
                Cutting-Edge R&amp;D
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#082F49]">
                Molecular-level engineering
              </h2>
              <p className="text-[#4B6584] leading-relaxed text-base sm:text-lg">
                Our labs use cryogenic electron microscopy and hexameric
                assembly techniques to validate drug candidates before they
                enter clinical environments.
              </p>
              <ul className="flex flex-col gap-3 mt-2">
                {checklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/60 hover:bg-white transition-colors"
                  >
                    <div className="shrink-0 w-8 h-8 bg-[#0284C7] rounded-full flex items-center justify-center text-white">
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-[#082F49] text-sm sm:text-base">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ PRODUCT CATALOGUE ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-white/50 border-y border-[#0284C7]/10">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="mb-10 sm:mb-14">
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-medium block mb-3">
              Product Catalogue
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#082F49]">
              Our product range
            </h2>
          </Reveal>

          {/* Desktop / tablet table */}
          <Reveal delay={100}>
            <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#0284C7]/10 shadow-sm bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#EAF6FF] border-b border-[#0284C7]/10">
                    {["Product", "Category", "Indication", "Dosage", "Status", "Price"].map((h) => (
                      <th key={h} className="p-5 font-display font-bold text-[#082F49] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0284C7]/10">
                  {products.map((p, i) => (
                    <tr
                      key={p.name}
                      className={`hover:bg-[#EAF6FF]/60 transition-colors ${i % 2 === 1 ? "bg-[#EAF6FF]/25" : ""}`}
                    >
                      <td className="p-5 font-bold text-[#0284C7] whitespace-nowrap">{p.name}</td>
                      <td className="p-5 text-[#4B6584] whitespace-nowrap">{p.category}</td>
                      <td className="p-5 text-[#4B6584] whitespace-nowrap">{p.indication}</td>
                      <td className="p-5 text-[#4B6584] whitespace-nowrap">{p.dosage}</td>
                      <td className="p-5 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-5 font-bold text-[#082F49] whitespace-nowrap">{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Mobile stacked cards */}
          <div className="sm:hidden flex flex-col gap-4">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-[#0284C7]/10 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-bold text-[#0284C7]">{p.name}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-[#4B6584]">
                    <span className="text-[#4B6584]/70">Category</span>
                    <span className="text-right font-medium text-[#082F49]">{p.category}</span>
                    <span className="text-[#4B6584]/70">Indication</span>
                    <span className="text-right font-medium text-[#082F49]">{p.indication}</span>
                    <span className="text-[#4B6584]/70">Dosage</span>
                    <span className="text-right font-medium text-[#082F49]">{p.dosage}</span>
                    <span className="text-[#4B6584]/70">Price</span>
                    <span className="text-right font-bold text-[#082F49]">{p.price}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center mb-16 sm:mb-24">
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#082F49] mb-4">
              From lab to patient
            </h2>
            <p className="text-[#4B6584] max-w-2xl mx-auto text-base sm:text-lg">
              Our rigorous four-stage pipeline ensures only the most
              effective and safe molecules reach the market.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-8 left-0 w-full h-px bg-[#0284C7]/15 -z-10" />
            {processSteps.map(({ icon: Icon, step, title, desc }, i) => (
              <Reveal key={step} delay={i * 100}>
                <div className="group bg-white p-7 sm:p-8 rounded-2xl border border-[#0284C7]/10 shadow-sm text-center relative hover:-translate-y-1.5 hover:shadow-lg transition-all duration-500">
                  <div className="font-display text-4xl text-[#0284C7]/10 absolute -top-6 left-1/2 -translate-x-1/2 font-black italic">
                    {step}
                  </div>
                  <div className="w-14 h-14 bg-[#0284C7] rounded-full mx-auto mb-5 flex items-center justify-center text-white shadow-lg shadow-[#0284C7]/20 group-hover:scale-110 transition-transform">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#082F49] mb-2">{title}</h3>
                  <p className="text-[#4B6584] text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="pb-20 sm:pb-28 px-6 sm:px-10 lg:px-16">
        <Reveal>
          <div className="max-w-[1280px] mx-auto rounded-[2rem] bg-[#082F49] px-8 sm:px-12 lg:px-16 py-14 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#0284C7]/25 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#22D3EE]/15 blur-3xl" />
            <div className="relative text-center md:text-left">
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                Ready to explore our product range?
              </h3>
              <p className="text-[#9DC8E6] max-w-md">
                Talk to our clinical team about availability, dosing
                guidance, or partnership opportunities.
              </p>
            </div>
            <button className="relative bg-white text-[#082F49] px-8 py-4 rounded-full font-semibold hover:bg-[#EAF6FF] transition-colors whitespace-nowrap flex items-center gap-2">
              Contact Sales <ArrowUpRight size={18} />
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}