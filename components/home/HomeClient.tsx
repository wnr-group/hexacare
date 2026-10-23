"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ConditionCarousel, { type CarouselCondition } from "@/components/conditions/ConditionCarousel";
import * as THREE from "three";
import {
  motion,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import { CapsuleScene, MoleculeSatellites, useThreeScene } from "@/components/common/ThreeScenes";
import {
  ShieldCheck,
  FlaskConical,
  Globe2,
  Dna,
  Network,
  Snowflake,
  Radar,
  Search,
  ShoppingCart,
  Star,
  Heart,
  Pill,
  ChevronRight
} from "lucide-react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}
// 3D story section: loaded on the client only, so three/r3f/gsap stay out of the initial bundle
const HexacareStory = dynamic(() => import("@/components/story/HexacareStory"), { ssr: false });

function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, scale: 0.97, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.9, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Thin brand-coloured bar that fills as the page is scrolled */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
      <motion.div
        style={{ scaleX }}
        className="h-full origin-left bg-gradient-to-r from-[#0284C7] via-[#22D3EE] to-[#0284C7]"
      />
    </div>
  );
}

/* Counts the first number in `value` up from 0 when scrolled into view, e.g. "3500+" or "₹70Cr+" */
function CountUp({ value }: { value: string }) {
  const match = /^(\D*?)(\d+)(?!\d*\s*[–-])(.*)$/.exec(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const target = match ? parseInt(match[2], 10) : 0;
  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(0, target, {
      duration: reduced ? 0 : 1.8,
      ease: "easeOut",
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, reduced]);
  return <span ref={ref}>{match ? `${match[1]}${shown}${match[3]}` : value}</span>;
}

/* Card that tilts toward the cursor with a moving highlight */
function TiltCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const spring = { stiffness: 220, damping: 22 };
  const rotateX = useSpring(useTransform(py, [0, 100], [5, -5]), spring);
  const rotateY = useSpring(useTransform(px, [0, 100], [-5, 5]), spring);
  const glow = useMotionTemplate`radial-gradient(260px circle at ${px}% ${py}%, rgba(34,211,238,0.18), transparent 60%)`;
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width) * 100);
        py.set(((e.clientY - r.top) / r.height) * 100);
      }}
      onMouseLeave={() => { px.set(50); py.set(50); }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        style={{ background: glow }}
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
      />
    </motion.div>
  );
}

function IconBadge({ Icon }: { Icon: React.ElementType }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-[#0284C7]/8 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors duration-500">
      <Icon size={22} strokeWidth={1.8} />
    </div>
  );
}

const stats = [
  { icon: Network, value: "3500+", label: "Pin codes served across India" },
  { icon: Radar, value: "24 hr", label: "Priority dispatch on every order" },
  { icon: Snowflake, value: "2–8°C", label: "Temperature held, door to door" },
  { icon: Globe2, value: "₹70Cr+", label: "Saved for patients and families" }
];

function useMoleculeScene() {
  return useThreeScene(({ scene, camera, prefersReduced, onCleanup }) => {
    // Camera sits further back to prevent top/bottom clipping
    camera.position.z = 18;

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
    const cylinderGeom = new THREE.CylinderGeometry(0.016, 0.016, radius * 2, 12);
    const mat1 = new THREE.MeshPhongMaterial({ color: blue, emissive: blue, emissiveIntensity: 0.5, shininess: 140, specular: white });
    const mat2 = new THREE.MeshPhongMaterial({ color: cyan, emissive: cyan, emissiveIntensity: 0.6, shininess: 120, specular: white });
    const rungMat = new THREE.MeshPhongMaterial({ color: "#BFE6FF", transparent: true, opacity: 0.35 });

    for (let i = 0; i < pointsCount; i++) {
      const y = (i - pointsCount / 2) * heightStep;
      const angle = i * rotationStep;
      const b1 = new THREE.Mesh(sphereGeom, mat1);
      b1.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      group.add(b1);
      const b2 = new THREE.Mesh(sphereGeom, mat2);
      b2.position.set(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius);
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

    let mouseX = 0;
    let mouseY = 0;
    const handleMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
    };
    window.addEventListener("mousemove", handleMove);
    onCleanup(() => window.removeEventListener("mousemove", handleMove));

    return () => {
      group.rotation.y += prefersReduced ? 0.0015 : 0.0065;
      group.rotation.x += (mouseY - group.rotation.x) * 0.05;
      group.rotation.z += (mouseX - group.rotation.z) * 0.05;
    };
  });
}

const readouts = [
  { label: "DRUG_ID", value: "HC-9921-X" },
  { label: "PURITY", value: "99.8%" },
  { label: "IN_STOCK", value: "YES" }
];

function SpecimenChamber() {
  const ref = useMoleculeScene();
  const [activeReadout, setActiveReadout] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveReadout(i => (i + 1) % readouts.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  return (
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
export default function Homepage({ conditions, featured }: { conditions: CarouselCondition[]; featured: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
    <div
      className="min-h-screen bg-[#EAF6FF] text-[#0B2545] overflow-x-clip"
    >
      <style>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .gradient-text { background: linear-gradient(90deg, #0284C7, #22D3EE, #0284C7); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; }
      `}</style>

      <ScrollProgress />

      <main>
        {/* HEXACARE STORY — 3D cinematic, lazy-loaded */}
        <HexacareStory />

        {/* 2. TRUST METRICS */}
        <Reveal>
          <section className="py-10 bg-white/60 border-b border-[#0284C7]/15">
            <div className="max-w-[1280px] mx-auto px-6 flex flex-wrap justify-center items-center gap-10 md:gap-24">
              {[
                { icon: ShieldCheck, label: "100% Genuine Products" },
                { icon: Globe2, label: "4,000+ Cities Covered" },
                { icon: Heart, label: "₹70Cr+ Patient Savings" },
                { icon: Snowflake, label: "Cold-Chain Integrity" }
              ].map(({ icon: Icon, label }, i) =>
                <Reveal key={label} delay={i * 120}>
                  <div className="group flex items-center gap-3 text-[#082F49] cursor-default">
                    <span className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#0284C7]/10 group-hover:bg-[#0284C7] transition-colors duration-300">
                      <motion.span animate={{ scale: [0.9, 1.25], opacity: [0.5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }} className="absolute inset-0 rounded-full border border-[#0284C7]/40" />
                      <Icon size={22} className="text-[#0284C7] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                    </span>
                    <span className="font-display font-bold text-sm md:text-base tracking-tight">
                      {label}
                    </span>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        </Reveal>

        {/* ============ WHY CHOOSE HEXACARE SECTION ============ */}
        <Reveal>
          <section className="py-20 px-6 md:px-16 bg-white/40 border-b border-[#0284C7]/15">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Heading & Accent */}
              <div className="lg:col-span-5 space-y-6">
                <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-bold block">
                  The HexaCare Advantage
                </span>
                <h2 className="font-display font-bold text-3xl md:text-5xl text-[#082F49] leading-tight">
                  Why thousands trust us for specialty care
                </h2>
                <p className="text-base sm:text-lg text-[#4B6584] leading-relaxed">
                  We bridge the gap between global pharmaceutical laboratories and your doorstep, ensuring affordability without compromising quality or thermal integrity.
                </p>
                <div className="p-6 bg-gradient-to-br from-[#0284C7] to-[#082F49] rounded-2xl text-white shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-110 transition-transform" />
                  <h4 className="font-display font-bold text-lg mb-2">Our Promise</h4>
                  <p className="text-xs text-[#EAF6FF]/95 leading-relaxed">
                    100% authentic medicine, kept strictly within designated temperature ranges, delivered directly to your home.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Direct Sourcing",
                    desc: "By partnering directly with manufacturers, we eliminate middle channels to guarantee authenticity and bypass cost markups.",
                    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15"
                  },
                  {
                    icon: Snowflake,
                    title: "Validated Cold Chain",
                    desc: "Medicines are transported in temperature-controlled boxes monitored continuously to maintain optimal molecular integrity.",
                    color: "bg-blue-500/10 text-blue-600 border-blue-500/15"
                  },
                  {
                    icon: Heart,
                    title: "Financial Relief",
                    desc: "Access competitive, direct-to-patient pricing on oncology, kidney, and chronic disease therapies, reducing the financial strain on families.",
                    color: "bg-rose-500/10 text-rose-600 border-rose-500/15"
                  },
                  {
                    icon: Globe2,
                    title: "Pan-India Access",
                    desc: "Rapid delivery of critical treatments across 4,000+ towns, cities, and rural locations nationwide.",
                    color: "bg-purple-500/10 text-purple-600 border-purple-500/15"
                  }
                ].map((item, idx) => (
                  <Reveal key={idx} delay={idx * 120} className="h-full"><div className="h-full bg-white rounded-3xl p-6 border border-[#0284C7]/10 hover:border-[#0284C7]/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${item.color} group-hover:scale-105 transition-transform`}>
                        <item.icon size={22} />
                      </div>
                      <h3 className="font-display font-bold text-lg text-[#082F49] mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-[#4B6584] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* 3. SHOP BY CATEGORY */}
        <Reveal>
          <section className="py-20 px-6 md:px-16">
            <div className="max-w-[1280px] mx-auto">
              <ConditionCarousel conditions={conditions} />
            </div>
          </section>
        </Reveal>

        {/* 4. FEATURED MEDICINES */}
        <Reveal>
          <section className="py-20 px-6 md:px-16 border-y border-[#0284C7]/15">
            <div className="max-w-[1280px] mx-auto">
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#082F49] via-[#0A3B5F] to-[#0369A1] shadow-2xl shadow-[#082F49]/30 mb-16">
                <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#22D3EE]/15 blur-3xl" />
                <div className="absolute -bottom-32 right-0 w-[520px] h-[520px] rounded-full bg-[#0284C7]/40 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:44px_44px]" />

                <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-0 p-8 sm:p-12 lg:p-16">
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <span className="font-mono text-[11px] tracking-[0.3em] text-[#22D3EE] uppercase font-bold">
                      Direct from the manufacturer
                    </span>
                    <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] text-white tracking-tight max-w-xl">
                      Specialty medicines, sourced <span className="text-[#22D3EE]">straight from the maker.</span>
                    </h2>
                    <p className="text-[#BFE3F8] text-base sm:text-lg leading-relaxed max-w-xl">
                      HexaCare brings genuine oncology, nephrology and rare-disorder therapies to your door with no middle channels and no hidden markups. Every batch is verified before it leaves our cold room.
                    </p>
                    <ul className="flex flex-col gap-3 mt-1">
                      {[
                        "100% genuine, batch-verified stock",
                        "Held at 2°C to 8°C from dispatch to delivery",
                        "Direct-to-patient pricing that eases the cost of care",
                      ].map((point) => (
                        <li key={point} className="flex items-center gap-3 text-white/90 text-sm sm:text-base">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center">
                            <ShieldCheck size={13} className="text-[#22D3EE]" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/medicines?stock=in"
                      className="mt-3 w-fit inline-flex items-center gap-2 bg-white text-[#082F49] px-7 py-3.5 rounded-full font-semibold hover:bg-[#22D3EE] transition-colors shadow-lg"
                    >
                      Browse all medicines <ChevronRight size={18} />
                    </Link>
                  </div>

                  <div className="lg:col-span-5 relative h-[340px] sm:h-[420px] lg:h-[480px]">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-dashed border-white/20" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-14 rounded-full border border-[#22D3EE]/25" />
                    <motion.div animate={{ scale: [0.9, 1.25], opacity: [0.5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }} className="absolute inset-10 rounded-full border border-[#22D3EE]/40" />
                    <CapsuleScene />
                  </div>
                </div>
              </div>

              <h2 className="font-display font-bold text-3xl text-[#082F49] mb-10 flex items-center justify-between">
                Available Medicines
                <Link href="/medicines?stock=in" className="text-sm font-medium text-[#0284C7] flex items-center hover:underline">
                  View all <ChevronRight size={16} />
                </Link>
              </h2>
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-6">{featured}</div>
            </div>
          </section>
        </Reveal>

        {/* 5. LOGISTICS & COLD CHAIN */}
        <Reveal>
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
        </Reveal>

        {/* 6. LOGISTICS STATISTICS */}
        <Reveal>
          <section className="py-24 px-6 md:px-16">
            <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-7">
                <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-4 block">
                  DELIVERY YOU CAN TRUST
                </span>
                <h2 className="font-display font-bold text-3xl md:text-[40px] leading-tight text-[#082F49] mb-5 tracking-tight">
                  From manufacturer to your doorstep, never off the cold chain
                </h2>
                <p className="text-[#4B6584] text-lg leading-relaxed max-w-xl mb-10">
                  Biologics and oncology therapies lose potency when temperatures drift. HexaCare packs every order in insulated bio-packaging, tracks it live, and hands it over intact, wherever you are in India.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {stats.map(({ icon: Icon, value, label }, i) => (
                    <Reveal key={label} delay={i * 120}>
                    <TiltCard className="h-full">
                    <div
                      className="group h-full bg-white/70 backdrop-blur-md border border-[#0284C7]/10 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0284C7]/10 transition-all duration-500"
                    >
                      <IconBadge Icon={Icon} />
                      <div className="font-display font-bold text-2xl text-[#0284C7] mt-4">
                        <CountUp value={value} />
                      </div>
                      <div className="text-[#082F49] font-semibold text-sm mt-1">
                        {label}
                      </div>
                    </div>
                    </TiltCard>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative max-w-md mx-auto lg:max-w-none">
                  <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-[#0284C7]/20 via-transparent to-[#22D3EE]/20 blur-2xl -z-10" />
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#082F49] via-[#0A3B5F] to-[#04202F] border border-white/60 shadow-2xl shadow-[#082F49]/30">
                    <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:40px_40px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] aspect-square rounded-full bg-[#0284C7]/30 blur-3xl" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-square rounded-full border border-dashed border-white/20" />
                    <motion.div animate={{ scale: [0.9, 1.25], opacity: [0.5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-full border border-[#22D3EE]/40" />
                    <MoleculeSatellites />

                    <motion.div animate={{ y: [0, -8, 0], rotate: [0, -1.5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-5 left-5 flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
                      <span className="text-white font-mono text-[10px] tracking-widest font-bold">TEMPERATURE: 2&ndash;8&deg;C</span>
                    </motion.div>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-[#22D3EE]/20 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-[#22D3EE]" />
                      </div>
                      <p className="text-white text-sm leading-snug">
                        <span className="font-bold">Potency protected.</span> <span className="text-white/75">Every dose arrives as the manufacturer intended.</span>
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* 7. PATIENT REVIEWS */}
        <Reveal>
          <section className="py-20 px-6 md:px-16 bg-[#082F49] text-white">
            <div className="max-w-[1280px] mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
                  Trusted by thousands across India
                </h2>
                <p className="text-[#9DC8E6] text-lg">
                  Real experiences from patients whose lives we&apos;ve impacted.
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
                  <Reveal key={i} delay={i * 150} className="h-full">
                  <TiltCard className="h-full">
                  <div
                    className="h-full bg-white/10 p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex gap-1 text-[#22D3EE] mb-4">
                      {[1, 2, 3, 4, 5].map(s =>
                        <Star key={s} size={16} fill="currentColor" />
                      )}
                    </div>
                    <p className="text-[#EAF6FF] text-[15px] leading-relaxed mb-6">
                      &ldquo;{rev.review}&rdquo;
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
                  </TiltCard>
                  </Reveal>
                )}
              </div>
            </div>
          </section>
        </Reveal>

      </main>
    </div>
    </MotionConfig>
  );
}
