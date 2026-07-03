'use client'
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import {
  ShieldCheck,
  Globe2,
  HeartHandshake,
  Target,
  Eye,
  Flag,
  Activity,
  Truck,
  ThermometerSnowflake,
  Users,
  Award,
  AlertCircle,
  Stethoscope,
  CalendarDays
} from "lucide-react";

/* ---------------------------------------------------------
   HEXACARE — Premium MNC About Us Page
   Palette: sky mist #EAF6FF · primary #0284C7 · deep navy #082F49
            cyan glow #22D3EE · slate #4B6584
   Display: Space Grotesk · Body: Inter
--------------------------------------------------------- */

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
      45,
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

// FIXED: Moved camera back to prevent top/bottom clipping
function HeroMolecule() {
  const ref = useThreeScene(({ scene, camera }) => {
    camera.position.z = 6.2; // Increased from 4.6 to give the model room
    const group = new THREE.Group();
    scene.add(group);

    const wireGeom = new THREE.IcosahedronGeometry(2, 3);
    const wireMat = new THREE.MeshPhongMaterial({ color: 0x0284c7, wireframe: true, transparent: true, opacity: 0.28 });
    const wireframe = new THREE.Mesh(wireGeom, wireMat);
    group.add(wireframe);

    const sphereGeom = new THREE.SphereGeometry(0.075, 12, 12);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0x0284c7 });
    const posAttr = wireGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const s = new THREE.Mesh(sphereGeom, sphereMat);
      s.position.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      group.add(s);
    }

    const coreGeom = new THREE.SphereGeometry(0.78, 64, 64);
    const coreMat = new THREE.MeshPhongMaterial({ color: 0x0284c7, emissive: 0x22d3ee, emissiveIntensity: 0.5, shininess: 100 });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    const light = new THREE.PointLight(0x22d3ee, 2, 12);
    light.position.set(2, 2, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    return () => {
      group.rotation.y += 0.0032;
      group.rotation.x += 0.0018;
      const scale = 1 + Math.sin(Date.now() * 0.001) * 0.045;
      wireframe.scale.setScalar(scale);
    };
  });
  return <div ref={ref} className="w-full h-full" />;
}

function HeritageGrowth() {
  const ref = useThreeScene(({ scene, camera }) => {
    camera.position.z = 6.5;
    camera.position.y = 0.4;
    const group = new THREE.Group();
    scene.add(group);

    const turns = 5;
    const pointsPerTurn = 24;
    const totalPoints = turns * pointsPerTurn;
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * turns * Math.PI * 2;
      const r = 0.15 + t * 1.9;
      const y = -2.6 + t * 5.2;
      curvePoints.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeom = new THREE.TubeGeometry(curve, 220, 0.028, 8, false);
    const tubeMat = new THREE.MeshPhongMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.25, shininess: 90, transparent: true, opacity: 0.85 });
    const tube = new THREE.Mesh(tubeGeom, tubeMat);
    group.add(tube);

    const nodeCount = 6;
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const t = i / (nodeCount - 1);
      const idx = Math.floor(t * totalPoints);
      const p = curvePoints[idx];
      const size = 0.06 + t * 0.16;
      const geom = new THREE.SphereGeometry(size, 24, 24);
      const mat = new THREE.MeshPhongMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.6, shininess: 120 });
      const node = new THREE.Mesh(geom, mat);
      node.position.copy(p);
      group.add(node);
      nodes.push(node);
    }

    const light1 = new THREE.PointLight(0x22d3ee, 2, 20);
    light1.position.set(4, 4, 4);
    scene.add(light1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
    light2.position.set(-4, 2, -4);
    scene.add(light2);
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    return () => {
      group.rotation.y += 0.0035;
      const pulse = 0.85 + Math.sin(Date.now() * 0.0015) * 0.15;
      nodes[nodes.length - 1].scale.setScalar(pulse);
    };
  });
  return <div ref={ref} className="w-full h-full" />;
}

// FIXED: Increased visibility and contained particles to remove stray dots
function InnovationCore() {
  const ref = useThreeScene(({ scene, camera }) => {
    camera.position.z = 5.5; // Adjusted camera
    const group = new THREE.Group();
    scene.add(group);

    // Made the wireframe brighter and more visible against the blue background
    const geom = new THREE.OctahedronGeometry(1.7, 4);
    const mat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff, 
      emissive: 0x22d3ee, 
      emissiveIntensity: 0.3,
      wireframe: true, 
      transparent: true, 
      opacity: 0.6 
    });
    const octa = new THREE.Mesh(geom, mat);
    group.add(octa);

    // Constrained particles tightly around the core to prevent "spillover" dots
    const pCount = 200; 
    const posArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
        // Keeps particles in a tight 3.5 unit radius
        posArr[i] = (Math.random() - 0.5) * 3.5; 
    }
    const particles = new THREE.BufferGeometry();
    particles.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    const pMat = new THREE.PointsMaterial({ 
      size: 0.03, 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.8 
    });
    const pSystem = new THREE.Points(particles, pMat);
    group.add(pSystem);

    // Added stronger lighting
    const light = new THREE.PointLight(0xffffff, 1.5, 10);
    light.position.set(2, 2, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    return () => {
      group.rotation.y += 0.0045;
      group.rotation.x += 0.0018;
    };
  });
  // Added overflow-hidden to absolutely ensure nothing spills out
  return <div ref={ref} className="w-full h-full overflow-hidden" />;
}

/* ---------- 3. UI Helpers ---------- */
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
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }});
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
      {children}
    </div>
  );
}

function ImagePortal({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative rounded-3xl overflow-hidden border-[8px] border-white shadow-[0_20px_50px_-15px_rgba(2,132,199,0.3)] ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
      <div className="absolute inset-0 bg-[#0284C7]/15 mix-blend-multiply pointer-events-none" />
    </div>
  );
}

/* ---------- Data Constants ---------- */
const missionVision = [
  { icon: Target, title: "Our Mission", desc: "To dismantle the barriers to super-specialty healthcare, ensuring every patient has access to authentic, life-saving medicines without financial ruin." },
  { icon: Eye, title: "Our Vision", desc: "To build a transparent, technology-driven healthcare ecosystem where quality treatment is a universal reality, not a privilege." },
  { icon: Flag, title: "Our Purpose", desc: "To serve as the crucial link between advanced pharmaceutical science and the patients who need it most, delivering hope alongside healing." }
];

const reality = [
  { title: "Prohibitive Costs", desc: "Life-saving treatments often come with crippling price tags. HexaCare confronts this by forging direct alliances with manufacturers to drastically reduce costs." },
  { title: "The Threat of Counterfeits", desc: "The specialty drug market is plagued by inauthentic products. We guarantee the provenance of every medicine, securing it directly from the source." },
  { title: "Logistical Fragility", desc: "Complex biologics require precise handling. HexaCare's proprietary cold-chain infrastructure ensures zero degradation from laboratory to your door." },
  { title: "Geographical Inequity", desc: "Advanced therapies shouldn't be confined to metropolises. Our robust distribution network delivers critical care to over 4,000+ pin codes across India." }
];

const values = [
  { icon: HeartHandshake, title: "Empathy", desc: "We place the patient at the center of every decision, understanding the profound challenges of managing complex health conditions." },
  { icon: Activity, title: "Innovation", desc: "We leverage technology to untangle the complexities of pharmaceutical procurement, making the process seamless and efficient." },
  { icon: Users, title: "Equity", desc: "We are committed to leveling the playing field, ensuring that vital resources are accessible to all, regardless of their location." },
  { icon: Truck, title: "Reliability", desc: "We view our logistics as a lifeline. Our rigorous tracking and temperature-controlled systems ensure absolute dependability." }
];

const leadership = [
  { name: "Anil Mehta", role: "Co-Founder & CEO" },
  { name: "Sneha Joshi", role: "Co-Founder & CBO" },
];

const medicalBoard = [
  { name: "Dr. Kirti Kabeer", role: "Consultant Oncologist" },
  { name: "Dr. Rohan Kapoor", role: "Medical Administrator" },
  { name: "P. Thirumal Reddy", role: "Clinical Data Expert" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-[#EAF6FF] text-[#0B2545] overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .editorial-title { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.1; letter-spacing: -0.02em; }
        .glass-panel { background: rgba(255,255,255,0.75); backdrop-filter: blur(20px); border: 1px solid rgba(2,132,199,0.15); }
      `}</style>

      {/* ============ 1. HERO SECTION (With Real Photography) ============ */}
   {/* ============ 1. HERO SECTION (Premium Bento Layout) ============ */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 px-6 md:px-16 overflow-hidden">
        {/* Soft Background Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#22D3EE]/15 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#0284C7]/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Content Column */}
          <div className="order-2 lg:order-1 space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0284C7]/20 bg-white/60 mb-2 shadow-sm">
                <Globe2 size={16} className="text-[#0284C7]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#0284C7]">About HexaCare</span>
              </div>
              <h1 className="editorial-title font-display font-bold text-[#082F49] mt-4">
                Redefining access to <br className="hidden md:block" /><span className="text-[#0284C7]">specialty care.</span>
              </h1>
            </Reveal>
            
            <Reveal delay={150}>
              <p className="text-lg text-[#4B6584] leading-relaxed max-w-lg">
                HexaCare emerged from a critical need: the disparity between advanced medical treatments and patient accessibility. As a leading specialized healthcare platform, we are dedicated to delivering vital therapies with transparency, speed, and affordability.
              </p>
            </Reveal>
            
            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-[#EAF6FF] bg-[#0284C7] flex items-center justify-center text-white font-bold text-sm z-10 relative shadow-md">
                      <Users size={18}/>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-[#082F49] text-lg">Empowering 3 Lakh+ Patients</p>
                  <p className="text-sm text-[#4B6584] font-medium">Across 4,000+ Indian Cities</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Image Column - Premium MNC Bento Grid */}
          <Reveal className="order-1 lg:order-2 w-full h-[450px] sm:h-[550px]" delay={200}>
            <div className="grid grid-cols-12 grid-rows-12 gap-3 sm:gap-4 w-full h-full">
              
              {/* Main Tall Image */}
              <div className="col-span-7 row-span-12 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-xl relative group">
                <img 
                  src="about_hero_image1.png" 
                  alt="Cold Chain Logistics" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#0284C7]/10 mix-blend-multiply pointer-events-none" />
              </div>

              {/* Top Right Image */}
              <div className="col-span-5 row-span-7 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-xl relative group">
                <img 
                  src="about_hero_image2.png" 
                  alt="Patient Care" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#0284C7]/10 mix-blend-multiply pointer-events-none" />
              </div>

              {/* Bottom Right Premium Trust Badge */}
              <div className="col-span-5 row-span-5 rounded-[2rem] overflow-hidden border-[6px] border-white shadow-xl bg-gradient-to-br from-[#0284C7] to-[#082F49] p-4 sm:p-5 flex flex-col justify-center text-white relative group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500" />
                <ShieldCheck size={28} className="text-[#22D3EE] mb-1 sm:mb-2" />
                <span className="text-2xl sm:text-3xl font-display font-bold leading-none">100%</span>
                <span className="text-[10px] sm:text-xs text-[#EAF6FF] mt-1 font-medium leading-snug">Genuine &<br/>Cold-Chain Secure</span>
              </div>

            </div>
          </Reveal>
        </div>
      </section>
      {/* ============ 2. MISSION, VISION, PURPOSE (Grid) ============ */}
      <section className="py-20 px-6 md:px-16 border-y border-[#0284C7]/15">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {missionVision.map((item, i) => (
            <Reveal key={item.title} delay={i * 150}>
              <div className="glass-panel p-10 rounded-[2rem] h-full hover:shadow-xl transition-shadow duration-500 hover:border-[#0284C7]/30">
                <div className="w-14 h-14 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-6">
                  <item.icon size={28} />
                </div>
                <h3 className="font-display font-bold text-2xl text-[#082F49] mb-4">{item.title}</h3>
                <p className="text-[#4B6584] leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 2.5 CORE VALUES SECTION ============ */}
      <section className="py-20 px-6 md:px-16 bg-white/40">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-bold block mb-3">
              Our Core Tenets
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-[#082F49]">
              Core Values of HexaCare
            </h2>
            <p className="text-sm sm:text-base text-[#4B6584] mt-4">
              These fundamental principles guide our daily decisions, supply chain logistics, and how we interact with patients.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <Reveal key={val.title} delay={idx * 100}>
                <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-[0_10px_30px_rgba(2,132,199,0.05)] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#EAF6FF] text-[#0284C7] flex items-center justify-center mb-6 shadow-sm">
                    <val.icon size={30} />
                  </div>
                  <h4 className="font-display font-bold text-xl text-[#082F49] mb-3">
                    {val.title}
                  </h4>
                  <p className="text-[#4B6584] text-sm leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. HERITAGE & ORIGIN ============ */}
      <section className="py-24 px-6 md:px-16 bg-white/40">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <Reveal className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <div className="space-y-3">
              <span className="font-mono text-[11px] tracking-[0.3em] text-[#4B6584] uppercase font-medium block">
                Established 2015
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#082F49] leading-tight">
                Our Origin &amp; Evolution
              </h2>
            </div>
            <div className="space-y-5 text-[#4B6584] leading-relaxed">
              <p>
                HexaCare was founded in 2015 by a team committed to solving the complexities of the specialty pharmaceutical supply chain. We recognized the urgent need for a dependable, transparent channel for high-stakes medications.
              </p>
              <p>
                From our initial focus on oncology, we have expanded our purview into nephrology, cardiology, and rare diseases. Today, HexaCare represents a unified platform bridging patients with the therapies they need to thrive.
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 pt-2">
              <div className="glass-panel p-5 sm:p-6 rounded-2xl shadow-sm w-32 sm:w-40 flex flex-col items-center text-center">
                <CalendarDays size={20} className="text-[#0284C7] mb-2" />
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#082F49]">2015</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#0284C7]/70 mt-1">Founded</span>
              </div>
              <div className="glass-panel p-5 sm:p-6 rounded-2xl shadow-sm w-32 sm:w-40 flex flex-col items-center text-center">
                <Award size={20} className="text-[#0284C7] mb-2" />
                <span className="text-2xl sm:text-3xl font-display font-bold text-[#082F49]">10+</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#0284C7]/70 mt-1">Years Legacy</span>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7 order-1 lg:order-2" delay={150}>
            <div className="relative h-[360px] sm:h-[460px] lg:h-[560px]">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#0284C7]/8 to-[#22D3EE]/8" />
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-[#0284C7]/15 shadow-sm">
                {/* <HeritageGrowth /> */}
                <img 
                  src="about_evaluation.png" 
                  alt="Patient Care" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 4. THE HEALTHCARE REALITY ============ */}
      <section className="py-24 px-6 md:px-16 border-t border-[#0284C7]/15">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-[#082F49] mb-6">
              The HexaCare Imperative
            </h2>
            <p className="text-lg text-[#4B6584]">
              We observed systemic failures in how critical care was administered and procured. HexaCare is our structural response to these industry-wide challenges.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reality.map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="flex gap-6 glass-panel p-8 rounded-3xl hover:shadow-md transition-shadow">
                  <div className="shrink-0 mt-1">
                    <AlertCircle className="text-[#0284C7]" size={28} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xl text-[#082F49] mb-3">{item.title}</h4>
                    <p className="text-[#4B6584] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5. PRECISION HANDLING (With HeroMolecule) ============ */}
      <section className="py-24 px-6 md:px-16 bg-white/40 border-t border-[#0284C7]/15">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 h-[400px] sm:h-[500px]">
            <Reveal className="h-full relative glass-panel rounded-3xl overflow-hidden p-4 border border-[#0284C7]/20 shadow-sm" delay={200}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0284C7]/5 to-[#22D3EE]/5" />
              <HeroMolecule />
            </Reveal>
          </div>
          <div className="lg:col-span-6 space-y-8">
            <Reveal>
              <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-medium block mb-4">
                Molecular Integrity
              </span>
              <h2 className="font-display font-bold text-3xl md:text-5xl text-[#082F49] leading-tight">
                Precision handling for complex biologics
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="text-lg text-[#4B6584] leading-relaxed">
                Super specialty medicines, especially targeted therapies and biologics, possess complex molecular structures that easily degrade under thermal stress. Our infrastructure is specifically engineered to protect these fragile compounds from manufacturer to patient.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <ul className="space-y-5 mt-4">
                <li className="flex items-center gap-4 text-[#082F49] font-medium text-lg">
                  <div className="w-10 h-10 rounded-full bg-[#EAF6FF] flex items-center justify-center text-[#0284C7]">
                    <ShieldCheck size={20} />
                  </div>
                  Zero-Degradation Guarantee
                </li>
                <li className="flex items-center gap-4 text-[#082F49] font-medium text-lg">
                  <div className="w-10 h-10 rounded-full bg-[#EAF6FF] flex items-center justify-center text-[#0284C7]">
                    <ThermometerSnowflake size={20} />
                  </div>
                  2°C to 8°C Continuous Cold-Chain
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 6. SCALE & IMPACT METRICS ============ */}
      <section className="py-20 px-6 md:px-16 bg-[#082F49] text-white">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center divide-x divide-white/10">
          {[
            { value: "5L+", label: "Orders Delivered" },
            { value: "4,000+", label: "Cities Covered" },
            { value: "100+", label: "Diseases Covered" },
            { value: "₹75Cr+", label: "Rupees Saved" }
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 100} className="px-4">
              <div className="font-display font-bold text-4xl md:text-5xl text-[#22D3EE] mb-2">{stat.value}</div>
              <div className="text-sm md:text-base font-semibold text-[#EAF6FF]/80 uppercase tracking-wider">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 7. CORE VALUES (With InnovationCore) ============ */}
      <section className="py-24 px-6 md:px-16 bg-white/50 border-y border-[#0284C7]/10">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase mb-4 block">
                Core Values
              </span>
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#082F49]">
                The tenets that guide our operations
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            <Reveal className="md:col-span-4">
              <div className="glass-panel rounded-[2rem] p-8 h-full flex flex-col justify-center min-h-[280px]">
                <div className="w-14 h-14 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[#082F49] mb-4">
                  Uncompromising Standards
                </h3>
                <p className="text-[#4B6584] leading-relaxed">
                  Our quality-check protocols exceed standard regulatory benchmarks. Every product is verified for authenticity before it is dispatched to a patient.
                </p>
              </div>
            </Reveal>

            {/* 3D Innovation Core Element */}
            <Reveal className="md:col-span-4" delay={120}>
              <div className="bg-[#0284C7] rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[320px] md:min-h-full">
                <div className="absolute inset-0">
                  <InnovationCore />
                </div>
                <div className="relative z-10 text-white text-center pointer-events-none">
                  <h3 className="font-display font-bold text-xl sm:text-2xl mb-2">
                    Digital Ecosystem
                  </h3>
                  <p className="font-mono text-[10px] sm:text-[11px] opacity-70 tracking-[0.25em] uppercase">
                    Tech-Driven Delivery
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="md:col-span-4 flex flex-col gap-6 sm:gap-8">
              <Reveal delay={200}>
                <div className="glass-panel rounded-[2rem] p-7">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center"><HeartHandshake size={24}/></div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#082F49]">Patient Care</h3>
                  </div>
                  <p className="text-[#4B6584] leading-relaxed text-sm">
                    We recognize the challenges patients face and ensure treatments reach them irrespective of location.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={280}>
                <div className="glass-panel rounded-[2rem] p-7">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center"><Truck size={24}/></div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-[#082F49]">Reliable Distribute</h3>
                  </div>
                  <p className="text-[#4B6584] leading-relaxed text-sm">
                    Our distribution network is designed for absolute reliability, maintaining the integrity of temperature-sensitive treatments.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. LEADERSHIP & MEDICAL BOARD ============ */}
      <section className="py-24 px-6 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          {/* Executive Leadership */}
          <Reveal className="mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-[#082F49] mb-10">Meet Our Founders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {leadership.map((leader, i) => (
                <div key={i} className="text-center group">
                  <div className="w-32 h-32 mx-auto rounded-full bg-[#0284C7] text-white flex items-center justify-center font-display text-4xl font-bold mb-4 shadow-lg group-hover:-translate-y-2 transition-transform duration-300 border-4 border-white">
                    {leader.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-[#082F49] text-lg">{leader.name}</h4>
                  <p className="text-[#0284C7] text-sm font-semibold">{leader.role}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <hr className="border-[#0284C7]/15 my-16" />

          {/* Medical Experts */}
          <Reveal>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-[#082F49] mb-4">Our Medical Advisory</h2>
            <p className="text-[#4B6584] mb-10 max-w-2xl">
              We are committed to offering reliable, evidence-based oversight, ensuring the highest clinical standards govern our procurement and patient advisory programs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {medicalBoard.map((doc, i) => (
                <div key={i} className="flex items-center gap-4 glass-panel p-6 rounded-2xl hover:border-[#0284C7]/30 transition-colors">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[#EAF6FF] text-[#082F49] flex items-center justify-center border border-[#0284C7]/20">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#082F49]">{doc.name}</h4>
                    <p className="text-[#4B6584] text-xs font-semibold uppercase tracking-wider mt-1">{doc.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}