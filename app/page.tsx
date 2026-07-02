"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ShieldCheck,
  FlaskConical,
  Globe2,
  Dna,
  Waves,
  Network,
  ArrowUpRight,
  Snowflake,
  Radar,
  Search,
  UploadCloud,
  ShoppingCart,
  Star,
  Activity,
  Heart,
  Pill,
  ChevronRight
} from "lucide-react";

function IconBadge({ Icon }: { Icon: React.ElementType }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-[#0284C7]/8 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors duration-500">
      <Icon size={22} strokeWidth={1.8} />
    </div>
  );
}

const stats = [
  { icon: Network, value: "3500+", label: "Pin Codes Covered" },
  { icon: Radar, value: "24 hr", label: "Priority Dispatch" },
  { icon: Snowflake, value: "Cold-Chain", label: "End-to-End Monitoring" },
  { icon: Globe2, value: "₹70Cr+", label: "Savings Generated" }
];
function useMoleculeScene(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(
    () => {
      const container = containerRef.current;
      if (!container) return;
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);

      // Positioned camera further back to prevent top/bottom clipping
      camera.position.z = 18;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const blue = new THREE.Color("#0284C7");
      const cyan = new THREE.Color("#22D3EE");
      const white = new THREE.Color("#ffffff");
      const pointsCount = 40;
      const radius = 2.1;
      const heightStep = 0.32;
      const rotationStep = 0.24;

      const sphereGeom = new THREE.SphereGeometry(0.12, 24, 24);
      const cylinderGeom = new THREE.CylinderGeometry(
        0.016,
        0.016,
        radius * 2,
        12
      );
      const mat1 = new THREE.MeshPhongMaterial({
        color: blue,
        emissive: blue,
        emissiveIntensity: 0.5,
        shininess: 140,
        specular: white
      });
      const mat2 = new THREE.MeshPhongMaterial({
        color: cyan,
        emissive: cyan,
        emissiveIntensity: 0.6,
        shininess: 120,
        specular: white
      });
      const rungMat = new THREE.MeshPhongMaterial({
        color: "#BFE6FF",
        transparent: true,
        opacity: 0.35
      });

      for (let i = 0; i < pointsCount; i++) {
        const y = (i - pointsCount / 2) * heightStep;
        const angle = i * rotationStep;
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const b1 = new THREE.Mesh(sphereGeom, mat1);
        b1.position.set(x1, y, z1);
        group.add(b1);
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;
        const b2 = new THREE.Mesh(sphereGeom, mat2);
        b2.position.set(x2, y, z2);
        group.add(b2);
        const rung = new THREE.Mesh(cylinderGeom, rungMat);
        rung.position.set(0, y, 0);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = -angle;
        group.add(rung);
      }

      scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const light1 = new THREE.PointLight(blue, 2.2, 40);
      light1.position.set(8, 8, 8);
      scene.add(light1);
      const light2 = new THREE.PointLight(cyan, 1.8, 40);
      light2.position.set(-8, -4, 6);
      scene.add(light2);

      let mouseX = 0,
        mouseY = 0;
      const handleMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
      };
      window.addEventListener("mousemove", handleMove);

      let raf: number;
      function animate() {
        raf = requestAnimationFrame(animate);
        group.rotation.y += prefersReduced ? 0.0015 : 0.0065;
        group.rotation.x += (mouseY - group.rotation.x) * 0.05;
        group.rotation.z += (mouseX - group.rotation.z) * 0.05;
        renderer.render(scene, camera);
      }
      animate();

      const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        if (container.contains(renderer.domElement))
          container.removeChild(renderer.domElement);
      };
    },
    [containerRef]
  );
}

const readouts = [
  { label: "DRUG_ID", value: "HC-9921-X" },
  { label: "PURITY", value: "99.8%" },
  { label: "IN_STOCK", value: "YES" }
];

function SpecimenChamber() {
  const ref = useRef<HTMLDivElement>(null);
  useMoleculeScene(ref);
  const [activeReadout, setActiveReadout] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveReadout(i => (i + 1) % readouts.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  return (
    // Responsive heights to ensure the 3D model fits perfectly on all screens
    <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#0284C7]/10 via-transparent to-[#22D3EE]/10 blur-2xl" />
      <div className="relative w-full h-full rounded-[2rem] border border-[#0284C7]/20 bg-white/50 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(2,132,199,0.35)]">
        <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent animate-[scan_4s_linear_infinite]" />

        <div
          ref={ref}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        <div className="absolute bottom-5 left-5 font-mono text-[11px] tracking-wider">
          <div className="text-[#0284C7]/70 mb-0.5">
            {readouts[activeReadout].label}
          </div>
          <div className="text-[#082F49] font-semibold">
            {readouts[activeReadout].value}
          </div>
        </div>
        <div className="absolute top-5 right-5 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#0284C7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
          COLD CHAIN ACTIVE
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Homepage() {
  return (
    <div
      className="min-h-screen bg-[#EAF6FF] text-[#0B2545]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
      `}</style>

      <main>
        {/* 1. HERO & SEARCH SECTION */}
        <section className="relative px-6 md:px-16 py-16 md:py-24 overflow-hidden border-b border-[#0284C7]/15 bg-gradient-to-b from-[#CFEBFF] via-[#EAF6FF] to-[#EAF6FF]">
          {/* ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#0284C7]/5 rounded-full blur-3xl -z-0" />

          <div className="max-w-[1440px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">

              {/* LEFT — Male doctor, pointing right toward the content */}
              <div className="hidden lg:flex lg:col-span-3 justify-end items-end h-full">
                <div className="relative w-full max-w-[300px]">
                  {/* glow behind figure */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-[260px] bg-[#0284C7]/15 rounded-full blur-3xl -z-10" />
                  <img
                    src="hero_male_doctor.png"
                    alt="Male doctor pointing toward specialty medicine offerings"
                    className="w-full h-[440px] object-contain object-bottom drop-shadow-2xl"
                  />
                  {/* trust chip near the pointing hand */}
                  <div className="absolute right-2 top-16 bg-white rounded-2xl shadow-lg shadow-[#0284C7]/20 border border-[#0284C7]/10 px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-[#082F49]">
                      GENUINE STOCK
                    </span>
                  </div>
                </div>
              </div>

              {/* CENTER CONTENT — unchanged */}
              <div className="lg:col-span-6 text-center relative z-10">
                <span className="font-mono text-[13px] tracking-[0.2em] text-[#0284C7] font-semibold mb-6 block bg-white/60 inline-block px-4 py-1.5 rounded-full border border-[#0284C7]/20">
                  INDIA'S NO.1 SPECIALTY PHARMACY
                </span>
                <h1 className="font-display font-bold text-[40px] leading-[1.1] sm:text-[52px] md:text-[64px] text-[#082F49] mb-6 tracking-tight max-w-4xl mx-auto">
                  Super specialty medicine, <br />
                  <span className="text-[#0284C7]">delivered direct</span> to you.
                </h1>
                <p className="text-lg leading-relaxed text-[#4B6584] max-w-2xl mx-auto mb-10">
                  Save up to 85% on cancer, kidney, and rare disorder treatments.
                  Genuine medicines sourced straight from the manufacturer.
                </p>

                {/* Mega Search Bar */}
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-2xl md:rounded-full shadow-xl shadow-[#0284C7]/10 border border-[#0284C7]/20">
                  <div className="flex-1 flex items-center px-4 w-full">
                    <Search className="text-[#0284C7] mr-3" size={24} />
                    <input
                      type="text"
                      placeholder="Search medicines, molecules, or diseases..."
                      className="w-full bg-transparent text-[#082F49] placeholder-[#4B6584] text-lg focus:outline-none py-2"
                    />
                  </div>
                  <button className="w-full md:w-auto bg-[#0284C7] text-white px-8 py-3.5 rounded-xl md:rounded-full font-semibold hover:bg-[#075985] transition-all flex items-center justify-center gap-2 shadow-md">
                    Search
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button className="flex items-center gap-2 bg-white text-[#082F49] border border-[#0284C7]/20 px-6 py-3 rounded-full hover:bg-[#EAF6FF] transition-colors font-medium shadow-sm">
                    <UploadCloud size={18} className="text-[#0284C7]" /> Order via
                    Prescription
                  </button>
                  <button className="flex items-center gap-2 bg-white text-[#082F49] border border-[#0284C7]/20 px-6 py-3 rounded-full hover:bg-[#EAF6FF] transition-colors font-medium shadow-sm">
                    <Activity size={18} className="text-[#0284C7]" /> Patient
                    Assistance Program
                  </button>
                </div>
              </div>

              {/* RIGHT — Female doctor, pointing left toward the content */}
              <div className="hidden lg:flex lg:col-span-3 justify-start items-end h-full">
                <div className="relative w-full max-w-[300px]">
                  {/* glow behind figure */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[260px] h-[260px] bg-[#0284C7]/15 rounded-full blur-3xl -z-10" />
                  <img
                    src="hero_female_doctor.png"
                    alt="Female doctor pointing toward specialty medicine offerings"
                    className="w-full h-[440px] object-contain object-bottom drop-shadow-2xl"
                  />
                  {/* trust chip near the pointing hand */}
                  <div className="absolute left-2 top-16 bg-white rounded-2xl shadow-lg shadow-[#0284C7]/20 border border-[#0284C7]/10 px-4 py-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
                    <span className="font-mono text-[11px] font-semibold text-[#082F49]">
                      UP TO 85% OFF
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. TRUST METRICS */}
        <section className="py-10 bg-white/60 border-b border-[#0284C7]/15">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap justify-center items-center gap-10 md:gap-24">
            {[
              { icon: ShieldCheck, label: "100% Genuine Products" },
              { icon: Globe2, label: "4,000+ Cities Covered" },
              { icon: Heart, label: "₹70Cr+ Patient Savings" },
              { icon: Snowflake, label: "Cold-Chain Integrity" }
            ].map(({ icon: Icon, label }) =>
              <div
                key={label}
                className="flex items-center gap-3 text-[#082F49]"
              >
                <Icon size={24} className="text-[#0284C7]" />
                <span className="font-display font-bold text-sm md:text-base tracking-tight">
                  {label}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 3. SHOP BY CATEGORY */}
        <section className="py-20 px-6 md:px-16">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-display font-bold text-3xl text-[#082F49] mb-10 flex items-center justify-between">
              Shop by Condition
              <span className="text-sm font-medium text-[#0284C7] flex items-center cursor-pointer hover:underline">
                View all <ChevronRight size={16} />
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: "Oncology", icon: Dna },
                { name: "Cardiology", icon: Heart },
                { name: "Nephrology", icon: Activity },
                { name: "Immunology", icon: ShieldCheck },
                { name: "Diabetes", icon: Pill },
                { name: "Women's Health", icon: FlaskConical }
              ].map((cat, i) =>
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-[#0284C7]/15 hover:border-[#0284C7]/30 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EAF6FF] text-[#0284C7] flex items-center justify-center mb-4 group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                    <cat.icon size={24} />
                  </div>
                  <span className="font-semibold text-[#082F49] text-sm">
                    {cat.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. FEATURED MEDICINES (E-Commerce Grid) */}
        <section className="py-20 px-6 md:px-16 bg-white/50 border-y border-[#0284C7]/15">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-display font-bold text-3xl text-[#082F49] mb-10">
              Top Selling Specialty Medicines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Hexa-Onco Pro+",
                  active: "VITAMINS, MINERALS",
                  old: "₹1,699",
                  new: "₹1,444",
                  save: "15%"
                },
                {
                  name: "CardiaCare Q10",
                  active: "CO-ENZYME Q10, L-CARNITINE",
                  old: "₹735",
                  new: "₹604",
                  save: "18%"
                },
                {
                  name: "NephroGuard Sachet",
                  active: "PROBIOTIC BLEND",
                  old: "₹393",
                  new: "₹324",
                  save: "18%"
                },
                {
                  name: "ImmunoBoost Injection",
                  active: "HUMAN PROTHROMBIN",
                  old: "₹20,810",
                  new: "₹15,544",
                  save: "25%"
                }
              ].map((prod, i) =>
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-[#0284C7]/15 flex flex-col relative group hover:border-[#0284C7]/30 hover:shadow-xl transition-all"
                >
                  <div className="absolute top-4 right-4 bg-[#22D3EE]/20 text-[#075985] text-xs font-bold px-2 py-1 rounded">
                    {prod.save} OFF
                  </div>
                  <div className="w-full h-32 bg-[#EAF6FF] rounded-xl flex items-center justify-center mb-4 text-[#0284C7]">
                    <Pill size={40} opacity={0.5} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#082F49] mb-1 leading-tight">
                    {prod.name}
                  </h3>
                  <p className="text-[#4B6584] text-xs font-mono mb-4 h-8">
                    {prod.active}
                  </p>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="text-xs text-[#4B6584] line-through block">
                        {prod.old}
                      </span>
                      <span className="font-bold text-[#0284C7] text-xl">
                        {prod.new}
                      </span>
                    </div>
                    <button className="bg-[#082F49] text-white p-2.5 rounded-lg hover:bg-[#0284C7] transition-colors shadow-sm">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. LOGISTICS & COLD CHAIN */}
        <section className="py-24 px-6 md:px-16">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6">
              <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-4 block">
                DELIVERY INFRASTRUCTURE
              </span>
              <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#082F49] mb-5 tracking-tight">
                Flawless cold-chain execution
              </h2>
              <p className="text-[#4B6584] text-lg leading-relaxed max-w-xl mb-10">
                Certain specialty medicines lose efficacy if temperatures
                fluctuate. HexaCare’s proprietary end-to-end monitoring network
                ensures treatments reach you in pristine, lab-quality condition.
              </p>

              <div className="flex flex-col gap-6">
                {[
                  {
                    icon: Radar,
                    title: "Live Tracking",
                    desc: "Real-time dispatch updates straight to your phone."
                  },
                  {
                    icon: Snowflake,
                    title: "Temperature Controlled",
                    desc:
                      "Insulated bio-packaging maintaining strict 2°C to 8°C environments."
                  }
                ].map((feature, i) =>
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#0284C7]/15 shadow-sm text-[#0284C7] flex items-center justify-center shrink-0">
                      <feature.icon size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#082F49]">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-[#4B6584] mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <SpecimenChamber />
            </div>
          </div>
        </section>

        <section className="py-24 px-6 md:px-16">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-4 block">
                DELIVERY INFRASTRUCTURE
              </span>
              <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#082F49] mb-5 tracking-tight">
                Excellence in specialty medicine logistics
              </h2>
              <p className="text-[#4B6584] text-lg leading-relaxed max-w-xl mb-10">
                Our robust cold-chain network ensures temperature-sensitive
                treatments reach your doorstep with absolute integrity, speed,
                and reliability &mdash; monitored end to end.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {stats.map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="group bg-white/70 backdrop-blur-md border border-[#0284C7]/10 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0284C7]/10 transition-all duration-500"
                  >
                    <IconBadge Icon={Icon} />
                    <div className="font-display font-bold text-2xl text-[#0284C7] mt-4">
                      {value}
                    </div>
                    <div className="text-[#082F49] font-semibold text-sm mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                {/* soft glow behind the frame */}
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#0284C7]/15 via-transparent to-[#22D3EE]/15 blur-2xl -z-10" />

                <div className="relative rounded-3xl border border-[#0284C7]/15 shadow-xl shadow-[#0284C7]/15 overflow-hidden bg-white/50 backdrop-blur-sm">
                  <img
                    src="logistic_image.png"
                    alt="Cold-chain logistics infrastructure"
                    className="w-full h-full object-cover aspect-[4/3]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PATIENT REVIEWS */}
        <section className="py-20 px-6 md:px-16 bg-[#082F49] text-white">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
                Trusted by thousands across India
              </h2>
              <p className="text-[#9DC8E6] text-lg">
                Real experiences from patients whose lives we've impacted.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Arjun Mehta",
                  loc: "Bangalore",
                  review:
                    "HexaCare delivered my father's oncology medicine within 24 hours. The discount saved us thousands, and the cold-chain packaging was impeccable."
                },
                {
                  name: "Priyanka S.",
                  loc: "Chennai",
                  review:
                    "Finding specialty drugs was a nightmare until I found this platform. Customer service is incredibly polite and understanding. A blessing!"
                },
                {
                  name: "Rahul D.",
                  loc: "Mumbai",
                  review:
                    "Genuine products, massive discounts, and direct manufacturer sourcing. I no longer worry about the authenticity of my mother's daily treatments."
                }
              ].map((rev, i) =>
                <div
                  key={i}
                  className="bg-white/10 p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex gap-1 text-[#22D3EE] mb-4">
                    {[1, 2, 3, 4, 5].map(s =>
                      <Star key={s} size={16} fill="currentColor" />
                    )}
                  </div>
                  <p className="text-[#EAF6FF] text-[15px] leading-relaxed mb-6">
                    "{rev.review}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-[#0284C7] flex items-center justify-center font-bold text-sm">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {rev.name}
                      </div>
                      <div className="text-xs text-[#9DC8E6]">
                        {rev.loc}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>



      </main>
    </div>
  );
}
