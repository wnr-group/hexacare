'use client'
import React, { useEffect, useRef, useState, type ReactNode, type ComponentType } from "react";
import * as THREE from "three";
import type { LucideProps } from "lucide-react";
import {
  ShieldCheck,
  BrainCog,
  Activity,
  LineChart,
  Check,
  Search,
  ArrowRight,
  ArrowUpRight,
  Radio,
  Snowflake,
  Truck,
  ChevronLeft,
  ChevronRight,
  ThermometerSnowflake,
  Filter,
  HeartHandshake,
  Headset,
  Globe
} from "lucide-react";
import ProductTable, { type Product, type ProductStatus, statusStyles } from "@/components/products/ProductTable";

/* ---------------------------------------------------------
   HEXACARE — MNC Products Page (Static/Informational)
--------------------------------------------------------- */

type IconType = ComponentType<LucideProps>;

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

function useThreeScene(setupFn: ThreeSceneSetup): React.RefObject<HTMLDivElement | null> {
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

/* ---------- 2. Three.js Components ---------- */
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

function MoleculeSatellites() {
  const ref = useThreeScene(({ scene, camera }) => {
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
      const time = Date.now() * 0.001;
      group.rotation.y += 0.005;
      group.rotation.x = Math.sin(time * 0.5) * 0.2;
      pulseLight.intensity = 1.4 + Math.sin(time * 3) * 0.5;
    };
  });
  return <div ref={ref} className="w-full h-full" />;
}

/* ---------- 3. UI Helpers ---------- */
interface RevealProps { children: ReactNode; className?: string; delay?: number; }
function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
      {children}
    </div>
  );
}

function IconBadge({ Icon, tone = "light" }: { Icon: IconType, tone?: "light" | "dark" }) {
  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${tone === "dark" ? "bg-white/15 text-white" : "bg-[#0284C7]/10 text-[#0284C7] group-hover:bg-[#0284C7] group-hover:text-white"}`}>
      <Icon size={22} strokeWidth={1.8} />
    </div>
  );
}

/* ---------- Data Constants ---------- */
const features = [
  { icon: Snowflake, title: "Cold-Chain Verified", desc: "Rigorous 2°C to 8°C temperature control from manufacturer to patient doorstep, ensuring zero efficacy loss." },
  { icon: BrainCog, title: "AI Inventory Prediction", desc: "Predictive algorithms prevent life-saving drug shortages by anticipating regional clinical demands." },
  { icon: ShieldCheck, title: "100% Genuine Sourcing", desc: "Direct procurement from global pharmaceutical giants eliminates counterfeit risks entirely." },
  { icon: Activity, title: "Patient Assistance", desc: "Dedicated support teams help patients navigate complex insurance and manufacturer discount programs." },
  { icon: Truck, title: "Pan-India Logistics", desc: "A proprietary delivery network ensuring critical treatments reach over 4,000+ pin codes rapidly." },
  { icon: LineChart, title: "Transparent Pricing", desc: "We bypass middlemen to offer up to 85% discounts on MRP for super specialty medicines." },
];



const allProducts: Product[] = [
  { name: "OncoTract 50mg", category: "Oncology", indication: "Targeted Therapy", dosage: "50mg Vial", status: "Special Order", info: "Contact for pricing" },
  { name: "NephroGuard Pro", category: "Nephrology", indication: "Renal Failure", dosage: "10 Sachet Box", status: "Available", info: "Ships in 24 hrs" },
  { name: "CardiaStat Q10", category: "Cardiology", indication: "Heart Failure", dosage: "30 Caps", status: "Available", info: "Ships in 24 hrs" },
  { name: "ImmunoBoost IV", category: "Immunology", indication: "Autoimmune", dosage: "250ml Infusion", status: "Special Order", info: "Cold-chain required" },
  { name: "DiaStabil Max", category: "Endocrinology", indication: "Type 1 Diabetes", dosage: "Pre-filled Pen", status: "Limited Stock", info: "Ships in 48 hrs" },
  { name: "NeuroProtect", category: "Neurology", indication: "Multiple Sclerosis", dosage: "120mg Tabs", status: "Special Order", info: "Contact for pricing" },
  { name: "HepatoCare Liq", category: "Hepatology", indication: "Liver Cirrhosis", dosage: "200ml Bottle", status: "Available", info: "Ships in 24 hrs" },
  { name: "OsteoFix Weekly", category: "Rheumatology", indication: "Osteoporosis", dosage: "1 Tablet/Week", status: "Available", info: "Ships in 24 hrs" },
  { name: "PulmoClear Aero", category: "Pulmonology", indication: "Severe Asthma", dosage: "Inhaler", status: "Limited Stock", info: "Ships in 48 hrs" },
  { name: "RheumaRelief", category: "Rheumatology", indication: "Arthritis", dosage: "10ml Injection", status: "Special Order", info: "Cold-chain required" },
  { name: "OncoBlock 100", category: "Oncology", indication: "Chemotherapy", dosage: "100mg Tabs", status: "Special Order", info: "Contact for pricing" },
  { name: "RenalClear IV", category: "Nephrology", indication: "Dialysis Support", dosage: "1L Bag", status: "Available", info: "Ships in 24 hrs" },
  { name: "CardioRhythm", category: "Cardiology", indication: "Arrhythmia", dosage: "50mg Tabs", status: "Available", info: "Ships in 24 hrs" },
  { name: "ImmunoSuppress", category: "Immunology", indication: "Transplant Rejection", dosage: "1mg Caps", status: "Limited Stock", info: "Ships in 48 hrs" },
];



export default function ProductPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const itemsPerPage = 6;

  // Extract unique categories for the filter buttons
  const categories = ["All", ...Array.from(new Set(allProducts.map(p => p.category)))];

  // Client-side filtering logic
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.indication.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const scrollToCatalogue = () => {
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Request Medicine Form State
  const [medName, setMedName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ medName?: string; quantity?: string; phone?: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { medName?: string; quantity?: string; phone?: string } = {};
    if (!medName.trim()) {
      errors.medName = "Medicine name is required";
    }
    if (!quantity.trim()) {
      errors.quantity = "Quantity is required";
    }
    if (!phone.trim()) {
      errors.phone = "Phone is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-[#EAF6FF] text-[#0B2545] overflow-x-hidden font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(2,132,199,0.15); }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spinSlow 15s linear infinite; }
      `}</style>

      {/* ============ 1. HERO ============ */}
      <section className="relative px-6 sm:px-10 lg:px-16 pt-24 pb-16 sm:pt-28 lg:pt-32 overflow-hidden border-b border-[#0284C7]/10">
        <div className="absolute top-0 left-0 w-[70%] h-full bg-[#0284C7]/8 blur-[140px] -z-10 rounded-full" />
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="flex flex-col gap-6">
              <span className="font-mono text-[11px] tracking-[0.25em] text-[#0284C7] uppercase font-bold bg-[#0284C7]/10 px-4 py-2 rounded-full w-fit border border-[#0284C7]/20">
                Specialty Medicine Division
              </span>
              <h1 className="font-display font-bold text-[38px] sm:text-[48px] lg:text-[56px] leading-[1.1] text-[#082F49] tracking-tight">
                Critical care,<br />delivered with <span className="text-[#0284C7]">precision.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#4B6584] leading-relaxed max-w-xl">
                Browse our comprehensive catalogue of super specialty medicines. Backed by end-to-end cold-chain logistics and verified manufacturer sourcing.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <button
                  onClick={scrollToCatalogue}
                  className="bg-[#0284C7] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#075985] transition-all shadow-lg shadow-[#0284C7]/20 active:scale-95 flex items-center gap-2"
                >
                  View Catalogue <ArrowRight size={18} />
                </button>
                <button className="bg-white border border-[#0284C7]/20 text-[#082F49] px-8 py-4 rounded-full font-semibold hover:bg-[#EAF6FF] transition-all active:scale-95 shadow-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative h-[380px] sm:h-[460px] lg:h-[560px]">
              <div className="absolute -inset-4 bg-[#0284C7]/10 rounded-full blur-3xl opacity-60" />
              <div className="relative w-full h-full bg-white/40 rounded-[2rem] border border-[#0284C7]/15 overflow-hidden shadow-2xl">
                <CapsuleScene />
                <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 glass-panel p-4 rounded-2xl shadow-lg max-w-[200px]">
                  <p className="font-mono text-[10px] tracking-widest text-[#0284C7] mb-1 font-bold">
                    QUALITY CONTROL
                  </p>
                  <p className="text-sm font-semibold text-[#082F49] leading-snug">
                    Zero degradation tolerance on specialty shipments.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 2. PRODUCT CATALOGUE ============ */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-white/50 border-y border-[#0284C7]/10" id="catalogue">
        <div className="max-w-[1280px] mx-auto">

          <Reveal className="mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-bold block mb-3">
                Product Database
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#082F49]">
                Specialty Therapeutics
              </h2>
            </div>

            {/* Search Input for Catalogue */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B6584]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines or conditions..."
                className="w-full pl-11 pr-4 py-3 rounded-full border border-[#0284C7]/20 bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-sm"
              />
            </div>
          </Reveal>

          {/* Category Filters */}
          <Reveal delay={50} className="mb-6">
            <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
              <Filter className="text-[#4B6584] mt-2 mr-2 shrink-0 hidden sm:block" size={20} />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition-all ${activeCategory === cat ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-md' : 'bg-white text-[#4B6584] border-[#0284C7]/20 hover:bg-[#EAF6FF]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Desktop / tablet table */}
          <Reveal delay={100}>
            <div className="hidden sm:block">
              <ProductTable products={currentProducts} />
              
              {/* MNC Style Numbered Pagination */}
              {totalPages > 0 && (
                <div className="p-5 border-t border-[#0284C7]/15 bg-[#F8FCFF] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-sm text-[#4B6584] font-medium">
                    Showing <span className="font-bold text-[#082F49]">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-[#082F49]">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-bold text-[#082F49]">{filteredProducts.length}</span> results
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-[#0284C7]/20 bg-white text-[#082F49] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EAF6FF] transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${currentPage === idx + 1
                            ? "bg-[#0284C7] text-white shadow-md border border-[#0284C7]"
                            : "bg-white border border-[#0284C7]/20 text-[#082F49] hover:bg-[#EAF6FF]"
                          }`}
                      >
                        {idx + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-[#0284C7]/20 bg-white text-[#082F49] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#EAF6FF] transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Mobile stacked cards */}
          <div className="sm:hidden flex flex-col gap-4 mt-4">
            {currentProducts.length > 0 ? currentProducts.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <div className="bg-white rounded-2xl border border-[#0284C7]/15 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#0284C7]/10">
                    <div>
                      <span className="font-display font-bold text-[#0284C7] text-lg block">{p.name}</span>
                      <span className="text-xs text-[#4B6584]">{p.dosage}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${statusStyles[p.status]}`}>{p.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-sm text-[#4B6584]">
                    <span className="text-[#4B6584]/70">Category</span><span className="text-right font-medium text-[#082F49]">{p.category}</span>
                    <span className="text-[#4B6584]/70">Indication</span><span className="text-right font-medium text-[#082F49]">{p.indication}</span>
                    <span className="text-[#4B6584]/70">Notes</span><span className="text-right font-medium text-[#082F49]">{p.info}</span>
                  </div>
                </div>
              </Reveal>
            )) : (
              <div className="text-center p-8 bg-white rounded-2xl text-[#4B6584] border border-[#0284C7]/15">No medicines found.</div>
            )}

            {/* Mobile Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-lg border border-[#0284C7]/20 bg-white text-[#082F49] disabled:opacity-50 font-medium text-sm shadow-sm">Prev</button>
                <span className="text-sm font-bold text-[#082F49]">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-lg border border-[#0284C7]/20 bg-white text-[#082F49] disabled:opacity-50 font-medium text-sm shadow-sm">Next</button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* ============ 4. FEATURES ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center mb-14 sm:mb-20">
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-bold block mb-4">
              The HexaCare Standard
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#082F49]">
              Built for clinical excellence
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="group h-full bg-white p-7 sm:p-8 rounded-2xl border border-[#0284C7]/10 border-b-4 border-b-[#0284C7] shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0284C7]/10 transition-all duration-300">
                  <IconBadge Icon={Icon} />
                  <h3 className="font-display font-bold text-lg text-[#082F49] mt-6 mb-2.5">{title}</h3>
                  <p className="text-[#4B6584] text-sm leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5. LOGISTICS ENGINEERING ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-white/40 border-y border-[#0284C7]/10">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-[#082F49]">
              <MoleculeSatellites />
              <div className="absolute top-5 left-5 sm:top-6 sm:left-6">
                <div className="px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                  <span className="text-white font-mono text-[10px] tracking-widest font-bold">BIOLOGIC STABILITY: SECURE</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={150}>
            <div className="flex flex-col gap-5">
              <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-bold">Logistics Engineering</span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#082F49]">Protecting fragile molecules</h2>
              <p className="text-[#4B6584] leading-relaxed text-base sm:text-lg">
                Complex biologics and oncology treatments degrade instantly under thermal stress. Our proprietary supply chain utilizes medical-grade thermal packaging to guarantee absolute stability.
              </p>
              <ul className="flex flex-col gap-3 mt-4">
                {["Continuous Thermal Monitoring", "Batch Authenticity Verification", "Direct-to-Patient Protocols"].map((item) => (
                  <li key={item} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#0284C7]/10 shadow-sm">
                    <div className="shrink-0 w-8 h-8 bg-[#0284C7] rounded-full flex items-center justify-center text-white"><Check size={16} strokeWidth={2.5} /></div>
                    <span className="font-bold text-[#082F49] text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 6. REQUEST MEDICINE ============ */}
      <section className="py-20 sm:py-28 px-6 sm:px-10 lg:px-16 bg-white/40 border-b border-[#0284C7]/10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="flex flex-col gap-6">
              <span className="font-mono text-[11px] tracking-[0.25em] text-[#0284C7] uppercase font-bold bg-[#0284C7]/10 px-4 py-2 rounded-full w-fit border border-[#0284C7]/20 flex items-center gap-2">
                <Globe size={14} className="animate-spin-slow" /> Global Sourcing
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#082F49] leading-tight">
                Can&apos;t Find What You&apos;re Looking For?
              </h2>
              <p className="text-base sm:text-lg text-[#4B6584] leading-relaxed max-w-xl">
                If a specific molecule or specialty medicine is not in our current catalogue, reach out to our dedicated clinical sourcing team. We are committed to assisting you in locating the treatments you need and providing guidance on availability and acquisition.
              </p>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#0284C7]/10 shadow-sm w-fit">
                <div className="w-10 h-10 rounded-full bg-[#EAF6FF] flex items-center justify-center text-[#0284C7] shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[#082F49] text-sm">Genuine & Verified</h4>
                  <p className="text-xs text-[#4B6584]">100% authentic sourcing protocols</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="glass-panel p-8 sm:p-10 rounded-3xl shadow-xl bg-white/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0284C7]/5 rounded-full blur-2xl" />

              {formSubmitted ? (
                <div className="text-center py-8 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#082F49]">Request Submitted!</h3>
                  <p className="text-sm text-[#4B6584] max-w-sm">
                    Thank you. We have received your request for <span className="font-bold text-[#0284C7]">{medName}</span>. Our clinical pharmacist will contact you at <span className="font-bold text-[#082F49]">{phone}</span> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setMedName("");
                      setQuantity("");
                      setPhone("");
                    }}
                    className="mt-4 bg-[#0284C7]/10 text-[#0284C7] hover:bg-[#0284C7] hover:text-white px-6 py-3 rounded-full text-sm font-semibold transition-all"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
                  <h3 className="font-display font-bold text-xl text-[#082F49] mb-1">Request Medicines</h3>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#082F49] mb-2 font-bold" htmlFor="medName">
                      Medicine Name
                    </label>
                    <input
                      id="medName"
                      type="text"
                      value={medName}
                      onChange={(e) => {
                        setMedName(e.target.value);
                        if (e.target.value.trim()) {
                          setFormErrors(prev => ({ ...prev, medName: undefined }));
                        }
                      }}
                      placeholder="Enter medicine name"
                      className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-sm text-[#082F49] placeholder:text-[#4B6584]/50 ${formErrors.medName ? 'border-rose-500' : 'border-[#0284C7]/20'}`}
                    />
                    {formErrors.medName && (
                      <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.medName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#082F49] mb-2 font-bold" htmlFor="quantity">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        if (e.target.value.trim()) {
                          setFormErrors(prev => ({ ...prev, quantity: undefined }));
                        }
                      }}
                      placeholder="e.g. 5"
                      min="1"
                      className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-sm text-[#082F49] placeholder:text-[#4B6584]/50 ${formErrors.quantity ? 'border-rose-500' : 'border-[#0284C7]/20'}`}
                    />
                    {formErrors.quantity && (
                      <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#082F49] mb-2 font-bold" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (e.target.value.trim()) {
                          setFormErrors(prev => ({ ...prev, phone: undefined }));
                        }
                      }}
                      placeholder="Enter phone number"
                      className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:border-[#0284C7] shadow-sm transition-colors text-sm text-[#082F49] placeholder:text-[#4B6584]/50 ${formErrors.phone ? 'border-rose-500' : 'border-[#0284C7]/20'}`}
                    />
                    {formErrors.phone && (
                      <p className="text-rose-600 text-xs mt-1 font-semibold">{formErrors.phone}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#0284C7] hover:bg-[#075985] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#0284C7]/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Request Medicines <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 7. CTA ============ */}
      <section className="pb-20 sm:pb-28 px-6 sm:px-10 lg:px-16 pt-20">
        <Reveal>
          <div className="max-w-[1280px] mx-auto rounded-[2rem] bg-[#082F49] px-8 sm:px-12 lg:px-16 py-14 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#0284C7]/25 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#22D3EE]/15 blur-3xl" />
            <div className="relative text-center md:text-left z-10">
              <h3 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-3">
                Require a specific specialty medicine?
              </h3>
              <p className="text-[#9DC8E6] max-w-md text-lg">
                Reach out to our clinical support team for availability, sourcing information, and guidance.
              </p>
            </div>
            <button className="relative z-10 bg-white text-[#082F49] px-8 py-4 rounded-full font-bold hover:bg-[#EAF6FF] transition-colors shadow-lg flex items-center gap-2 whitespace-nowrap">
              <Headset size={18} /> Contact Support
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}