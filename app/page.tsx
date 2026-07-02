// 'use client'
// import React, { useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import {
//   ShieldCheck,
//   FlaskConical,
//   Globe2,
//   Dna,
//   Waves,
//   Network,
//   ArrowUpRight,
//   Snowflake,
//   Radar,
// } from "lucide-react";

// /* ---------------------------------------------------------
//    LUMINA BIOWORKS — homepage
//    Palette: sky mist #EAF6FF · primary #0284C7 · deep navy #082F49
//             cyan glow #22D3EE · ink #0B2545 · slate #4B6584
//    Display: Space Grotesk · Body: Inter · Data: JetBrains Mono
// --------------------------------------------------------- */

// function useMoleculeScene(containerRef: React.RefObject<HTMLDivElement | null>) {
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const prefersReduced = window.matchMedia(
//       "(prefers-reduced-motion: reduce)"
//     ).matches;

//     const width = container.clientWidth;
//     const height = container.clientHeight;

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
//     camera.position.z = 11;

//     const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     container.appendChild(renderer.domElement);

//     const group = new THREE.Group();
//     scene.add(group);

//     const blue = new THREE.Color("#0284C7");
//     const cyan = new THREE.Color("#22D3EE");
//     const white = new THREE.Color("#ffffff");

//     const pointsCount = 40;
//     const radius = 2.1;
//     const heightStep = 0.32;
//     const rotationStep = 0.24;

//     const sphereGeom = new THREE.SphereGeometry(0.12, 24, 24);
//     const cylinderGeom = new THREE.CylinderGeometry(0.016, 0.016, radius * 2, 12);

//     const mat1 = new THREE.MeshPhongMaterial({
//       color: blue,
//       emissive: blue,
//       emissiveIntensity: 0.5,
//       shininess: 140,
//       specular: white,
//     });
//     const mat2 = new THREE.MeshPhongMaterial({
//       color: cyan,
//       emissive: cyan,
//       emissiveIntensity: 0.6,
//       shininess: 120,
//       specular: white,
//     });
//     const rungMat = new THREE.MeshPhongMaterial({
//       color: "#BFE6FF",
//       transparent: true,
//       opacity: 0.35,
//     });

//     for (let i = 0; i < pointsCount; i++) {
//       const y = (i - pointsCount / 2) * heightStep;
//       const angle = i * rotationStep;

//       const x1 = Math.cos(angle) * radius;
//       const z1 = Math.sin(angle) * radius;
//       const b1 = new THREE.Mesh(sphereGeom, mat1);
//       b1.position.set(x1, y, z1);
//       group.add(b1);

//       const x2 = Math.cos(angle + Math.PI) * radius;
//       const z2 = Math.sin(angle + Math.PI) * radius;
//       const b2 = new THREE.Mesh(sphereGeom, mat2);
//       b2.position.set(x2, y, z2);
//       group.add(b2);

//       const rung = new THREE.Mesh(cylinderGeom, rungMat);
//       rung.position.set(0, y, 0);
//       rung.rotation.z = Math.PI / 2;
//       rung.rotation.y = -angle;
//       group.add(rung);
//     }

//     scene.add(new THREE.AmbientLight(0xffffff, 0.65));
//     const light1 = new THREE.PointLight(blue, 2.2, 40);
//     light1.position.set(8, 8, 8);
//     scene.add(light1);
//     const light2 = new THREE.PointLight(cyan, 1.8, 40);
//     light2.position.set(-8, -4, 6);
//     scene.add(light2);

//     let mouseX = 0;
//     let mouseY = 0;
//     const handleMove = (e: MouseEvent) => {
//       mouseX = (e.clientX / window.innerWidth - 0.5) * 0.35;
//       mouseY = (e.clientY / window.innerHeight - 0.5) * 0.35;
//     };
//     window.addEventListener("mousemove", handleMove);

//     let raf: number;
//     function animate() {
//       raf = requestAnimationFrame(animate);
//       group.rotation.y += prefersReduced ? 0.0015 : 0.0065;
//       group.rotation.x += (mouseY - group.rotation.x) * 0.05;
//       group.rotation.z += (mouseX - group.rotation.z) * 0.05;
//       renderer.render(scene, camera);
//     }
//     animate();

//     const handleResize = () => {
//       const w = container.clientWidth;
//       const h = container.clientHeight;
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//     };
//     window.addEventListener("resize", handleResize);

//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("mousemove", handleMove);
//       window.removeEventListener("resize", handleResize);
//       renderer.dispose();
//       if (container.contains(renderer.domElement)) {
//         container.removeChild(renderer.domElement);
//       }
//     };
//   }, [containerRef]);
// }

// const readouts = [
//   { label: "SEQ_ID", value: "LB-2291-A" },
//   { label: "BINDING", value: "94.2%" },
//   { label: "STATUS", value: "ACTIVE" },
// ];

// function SpecimenChamber() {
//   const ref = useRef<HTMLDivElement>(null);
//   useMoleculeScene(ref);
//   const [activeReadout, setActiveReadout] = useState(0);

//   useEffect(() => {
//     const id = setInterval(
//       () => setActiveReadout((i) => (i + 1) % readouts.length),
//       2600
//     );
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-center">
//       {/* outer glow */}
//       <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#0284C7]/10 via-transparent to-[#22D3EE]/10 blur-2xl" />

//       {/* chamber frame */}
//       <div className="relative w-full h-full rounded-[2rem] border border-[#0284C7]/20 bg-white/50 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(2,132,199,0.35)]">
//         {/* corner brackets */}
//         {[
//           "top-4 left-4 border-t-2 border-l-2 rounded-tl-lg",
//           "top-4 right-4 border-t-2 border-r-2 rounded-tr-lg",
//           "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg",
//           "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg",
//         ].map((cls, i) => (
//           <div
//             key={i}
//             className={`absolute w-7 h-7 border-[#0284C7]/50 ${cls}`}
//           />
//         ))}

//         {/* scan line */}
//         <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent animate-[scan_4s_linear_infinite]" />

//         {/* 3D model */}
//         <div ref={ref} className="w-full h-full cursor-grab active:cursor-grabbing" />

//         {/* floating readout */}
//         <div className="absolute bottom-5 left-5 font-mono text-[11px] tracking-wider">
//           <div className="text-[#0284C7]/70 mb-0.5">
//             {readouts[activeReadout].label}
//           </div>
//           <div className="text-[#082F49] font-semibold">
//             {readouts[activeReadout].value}
//           </div>
//         </div>

//         <div className="absolute top-5 right-5 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[#0284C7]">
//           <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
//           LIVE MODEL
//         </div>
//       </div>
//     </div>
//   );
// }

// const stats = [
//   { icon: Network, value: "120+", label: "Global Hubs" },
//   { icon: Radar, value: "2 hr", label: "Emergency Dispatch" },
//   { icon: Snowflake, value: "Cold-Chain", label: "End-to-End Monitoring" },
//   { icon: Globe2, value: "180+", label: "Countries Served" },
// ];

// const certifications = [
//   { icon: ShieldCheck, label: "FDA CERTIFIED" },
//   { icon: ShieldCheck, label: "ISO 27001" },
//   { icon: FlaskConical, label: "GLP COMPLIANT" },
//   { icon: Globe2, label: "WHO PREQUALIFIED" },
// ];

// const innovations = [
//   {
//     icon: Dna,
//     title: "Nano-Carrier System",
//     desc: "Lipid-based delivery vehicles cross the blood-brain barrier with unprecedented precision, enabling targeted therapies for the central nervous system.",
//   },
//   {
//     icon: Waves,
//     title: "Targeted Bi-Specifics",
//     desc: "Dual-action antibodies that engage the immune system and the tumor microenvironment at once, built for measurable clinical efficacy.",
//   },
//   {
//     icon: Network,
//     title: "AI Discovery Engine",
//     desc: "Proprietary models predict protein binding affinity at 94% accuracy, compressing years of discovery work into a shorter path to trials.",
//   },
// ];

// function IconBadge({ Icon }: { Icon: React.ElementType }) {
//   return (
//     <div className="w-12 h-12 rounded-xl bg-[#0284C7]/8 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors duration-500">
//       <Icon size={22} strokeWidth={1.8} />
//     </div>
//   );
// }

// export default function Homepage() {
//   return (
//     <div
//       className="min-h-screen bg-[#EAF6FF] text-[#0B2545]"
//       style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
//         .font-display { font-family: 'Space Grotesk', sans-serif; }
//         .font-mono { font-family: 'JetBrains Mono', monospace; }
//         @keyframes scan {
//           0% { top: 0%; opacity: 0; }
//           10% { opacity: 1; }
//           90% { opacity: 1; }
//           100% { top: 100%; opacity: 0; }
//         }
//         @keyframes floatSlow {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-10px); }
//         }
//         .float-slow { animation: floatSlow 6s ease-in-out infinite; }
//       `}</style>

//       <main>
//         {/* HERO */}
//         <section className="relative px-6 md:px-16 py-16 md:py-24 overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-b from-[#CFEBFF] via-[#EAF6FF] to-[#EAF6FF] -z-10" />
//           <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
//             <div className="lg:col-span-6">
//               <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-6 block">
//                 PRECISION BIOTHERAPEUTICS
//               </span>
//               <h1 className="font-display font-bold text-[40px] leading-[1.08] sm:text-[52px] md:text-[60px] text-[#082F49] mb-6 tracking-tight">
//                 Engineering tomorrow's{" "}
//                 <span className="text-[#0284C7]">biotherapeutic</span>{" "}
//                 medicine
//               </h1>
//               <p className="text-lg leading-relaxed text-[#4B6584] max-w-lg mb-10">
//                 Lumina Bioworks fuses molecular intelligence with clinical
//                 discipline to move life-changing therapies from the bench to
//                 the patient, faster and with greater precision.
//               </p>
//               <div className="flex flex-wrap gap-4 mb-12">
//                 <button className="bg-[#0284C7] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#075985] transition-all shadow-lg shadow-[#0284C7]/20 flex items-center gap-2">
//                   Our Technology <ArrowUpRight size={18} />
//                 </button>
//                 <button className="border border-[#0284C7]/30 px-8 py-4 rounded-full font-semibold text-[#082F49] hover:bg-white/60 transition-all">
//                   View Pipeline
//                 </button>
//               </div>

//               <div className="flex flex-wrap gap-8 pt-8 border-t border-[#0284C7]/15">
//                 {[
//                   ["94%", "Binding Accuracy"],
//                   ["180+", "Countries Served"],
//                   ["12", "Active Programs"],
//                 ].map(([val, label]) => (
//                   <div key={label}>
//                     <div className="font-display font-bold text-2xl text-[#082F49]">
//                       {val}
//                     </div>
//                     <div className="text-xs text-[#4B6584] mt-1">{label}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="lg:col-span-6">
//               <SpecimenChamber />
//             </div>
//           </div>
//         </section>

//         {/* CERTIFICATIONS */}
//         <section className="py-10 bg-white/60 border-y border-[#0284C7]/10">
//           <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-wrap justify-center items-center gap-10 md:gap-20">
//             {certifications.map(({ icon: Icon, label }) => (
//               <div
//                 key={label}
//                 className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity"
//               >
//                 <Icon size={22} className="text-[#082F49]" strokeWidth={1.8} />
//                 <span className="font-display font-bold text-sm tracking-tight text-[#082F49]">
//                   {label}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* INFRASTRUCTURE */}
//         <section className="py-24 px-6 md:px-16">
//           <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
//             <div className="lg:col-span-7">
//               <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-4 block">
//                 GLOBAL INFRASTRUCTURE
//               </span>
//               <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#082F49] mb-5 tracking-tight">
//                 Excellence in pharmaceutical logistics
//               </h2>
//               <p className="text-[#4B6584] text-lg leading-relaxed max-w-xl mb-10">
//                 Our cold-chain network moves life-saving treatments across
//                 the world with absolute integrity, speed, and reliability
//                 &mdash; monitored end to end.
//               </p>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                 {stats.map(({ icon: Icon, value, label }) => (
//                   <div
//                     key={label}
//                     className="group bg-white/70 backdrop-blur-md border border-[#0284C7]/10 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0284C7]/10 transition-all duration-500"
//                   >
//                     <IconBadge Icon={Icon} />
//                     <div className="font-display font-bold text-2xl text-[#0284C7] mt-4">
//                       {value}
//                     </div>
//                     <div className="text-[#082F49] font-semibold text-sm mt-1">
//                       {label}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="lg:col-span-5">
//               <NetworkGraphic />
//             </div>
//           </div>
//         </section>

//         {/* INNOVATIONS */}
//         <section className="py-24 px-6 md:px-16 bg-white/50 border-y border-[#0284C7]/10">
//           <div className="max-w-[1280px] mx-auto">
//             <div className="text-center mb-16">
//               <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-4 block">
//                 RESEARCH &amp; DEVELOPMENT
//               </span>
//               <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#082F49] tracking-tight mb-4">
//                 Breakthrough innovations
//               </h2>
//               <p className="text-[#4B6584] text-lg max-w-2xl mx-auto">
//                 Pushing the boundaries of biopharmaceutical science through
//                 molecular engineering and applied machine learning.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {innovations.map(({ icon: Icon, title, desc }) => (
//                 <div
//                   key={title}
//                   className="group flex flex-col bg-white rounded-3xl border border-[#0284C7]/10 p-8 hover:shadow-xl hover:shadow-[#0284C7]/10 hover:-translate-y-1 transition-all duration-500"
//                 >
//                   <IconBadge Icon={Icon} />
//                   <h3 className="font-display font-bold text-xl text-[#082F49] mt-6 mb-3">
//                     {title}
//                   </h3>
//                   <p className="text-[#4B6584] text-[15px] leading-relaxed flex-1">
//                     {desc}
//                   </p>
//                   <button className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] group-hover:gap-2.5 transition-all">
//                     Learn more <ArrowUpRight size={16} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* CTA BAND */}
//         <section className="py-20 px-6 md:px-16">
//           <div className="max-w-[1280px] mx-auto rounded-[2rem] bg-[#082F49] px-8 md:px-16 py-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
//             <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#0284C7]/20 blur-3xl" />
//             <div className="relative">
//               <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
//                 Partner with our research network
//               </h3>
//               <p className="text-[#9DC8E6] max-w-md">
//                 Collaborate with Lumina Bioworks on clinical programs,
//                 licensing, or joint discovery initiatives.
//               </p>
//             </div>
//             <button className="relative bg-white text-[#082F49] px-8 py-4 rounded-full font-semibold hover:bg-[#EAF6FF] transition-colors whitespace-nowrap">
//               Get in touch
//             </button>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

// function NetworkGraphic() {
//   const nodes: [number, number][] = [
//     [40, 60], [140, 30], [230, 80], [310, 40], [70, 160],
//     [190, 190], [280, 150], [120, 240], [250, 260], [40, 220],
//   ];
//   const arcs: [number, number][] = [
//     [0, 2], [1, 3], [4, 6], [5, 8], [0, 5], [3, 6], [7, 9], [1, 4],
//   ];
//   return (
//     <div className="relative w-full aspect-[4/3] rounded-3xl bg-white/60 backdrop-blur-md border border-[#0284C7]/10 overflow-hidden float-slow">
//       <svg viewBox="0 0 340 300" className="w-full h-full">
//         <rect width="340" height="300" fill="none" />
//         {arcs.map(([a, b], i) => {
//           const [x1, y1] = nodes[a];
//           const [x2, y2] = nodes[b];
//           const mx = (x1 + x2) / 2;
//           const my = (y1 + y2) / 2 - 30;
//           return (
//             <path
//               key={i}
//               d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
//               stroke="#0284C7"
//               strokeWidth="1"
//               fill="none"
//               opacity="0.35"
//             />
//           );
//         })}
//         {nodes.map(([x, y], i) => (
//           <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={i % 3 === 0 ? "#0284C7" : "#22D3EE"} />
//         ))}
//       </svg>
//       <div className="absolute bottom-5 left-5 font-mono text-[11px] text-[#0284C7]/70 tracking-wider">
//         NETWORK.STATUS: ONLINE
//       </div>
//     </div>
//   );
// }

'use client'
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
} from "lucide-react";

/* ---------------------------------------------------------
   HEXACARE — homepage
   Palette: sky mist #EAF6FF · primary #0284C7 · deep navy #082F49
            cyan glow #22D3EE · ink #0B2545 · slate #4B6584
   Display: Space Grotesk · Body: Inter · Data: JetBrains Mono
--------------------------------------------------------- */

function useMoleculeScene(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.z = 11;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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
    const cylinderGeom = new THREE.CylinderGeometry(0.016, 0.016, radius * 2, 12);

    const mat1 = new THREE.MeshPhongMaterial({
      color: blue,
      emissive: blue,
      emissiveIntensity: 0.5,
      shininess: 140,
      specular: white,
    });
    const mat2 = new THREE.MeshPhongMaterial({
      color: cyan,
      emissive: cyan,
      emissiveIntensity: 0.6,
      shininess: 120,
      specular: white,
    });
    const rungMat = new THREE.MeshPhongMaterial({
      color: "#BFE6FF",
      transparent: true,
      opacity: 0.35,
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

    let mouseX = 0;
    let mouseY = 0;
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
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);
}

const readouts = [
  { label: "DRUG_ID", value: "HC-9921-X" },
  { label: "PURITY", value: "99.8%" },
  { label: "IN_STOCK", value: "YES" },
];

function SpecimenChamber() {
  const ref = useRef<HTMLDivElement>(null);
  useMoleculeScene(ref);
  const [activeReadout, setActiveReadout] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActiveReadout((i) => (i + 1) % readouts.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] flex items-center justify-center">
      {/* outer glow */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#0284C7]/10 via-transparent to-[#22D3EE]/10 blur-2xl" />

      {/* chamber frame */}
      <div className="relative w-full h-full rounded-[2rem] border border-[#0284C7]/20 bg-white/50 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(2,132,199,0.35)]">
        {/* corner brackets */}
        {[
          "top-4 left-4 border-t-2 border-l-2 rounded-tl-lg",
          "top-4 right-4 border-t-2 border-r-2 rounded-tr-lg",
          "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-lg",
          "bottom-4 right-4 border-b-2 border-r-2 rounded-br-lg",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-7 h-7 border-[#0284C7]/50 ${cls}`}
          />
        ))}

        {/* scan line */}
        <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent animate-[scan_4s_linear_infinite]" />

        {/* 3D model */}
        <div ref={ref} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* floating readout */}
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

const stats = [
  { icon: Network, value: "3500+", label: "Pin Codes Covered" },
  { icon: Radar, value: "24 hr", label: "Priority Dispatch" },
  { icon: Snowflake, value: "Cold-Chain", label: "End-to-End Monitoring" },
  { icon: Globe2, value: "₹70Cr+", label: "Savings Generated" },
];

const certifications = [
  { icon: ShieldCheck, label: "100% GENUINE" },
  { icon: ShieldCheck, label: "FSSAI APPROVED" },
  { icon: FlaskConical, label: "DOCTOR TRUSTED" },
  { icon: Globe2, label: "PAN-INDIA DELIVERY" },
];

const innovations = [
  {
    icon: Dna,
    title: "Patient Assistance Programs",
    desc: "Receive expert guidance on enrolling in support programs that offer significant savings on specialty and imported medicines.",
  },
  {
    icon: Waves,
    title: "Direct Manufacturer Sourcing",
    desc: "We eliminate middlemen to bring you 100% genuine medicines straight from reputable pharmaceutical manufacturers at unbeatable prices.",
  },
  {
    icon: Network,
    title: "Specialty & Rare Imports",
    desc: "Access life-saving, hard-to-find drugs sourced globally, with dedicated 24/7 support for all your complex medical requirements.",
  },
];

function IconBadge({ Icon }: { Icon: React.ElementType }) {
  return (
    <div className="w-12 h-12 rounded-xl bg-[#0284C7]/8 text-[#0284C7] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors duration-500">
      <Icon size={22} strokeWidth={1.8} />
    </div>
  );
}

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
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
      `}</style>

      <main>
        {/* HERO */}
        <section className="relative px-6 md:px-16 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CFEBFF] via-[#EAF6FF] to-[#EAF6FF] -z-10" />
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-6 block">
                SUPER SPECIALTY HEALTHCARE
              </span>
              <h1 className="font-display font-bold text-[40px] leading-[1.08] sm:text-[52px] md:text-[60px] text-[#082F49] mb-6 tracking-tight">
                Delivering India's{" "}
                <span className="text-[#0284C7]">super specialty</span>{" "}
                medicine
              </h1>
              <p className="text-lg leading-relaxed text-[#4B6584] max-w-lg mb-10">
                HexaCare connects patients with life-saving specialty medicines, ensuring direct access, cold-chain integrity, and unparalleled discounts across India.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <button className="bg-[#0284C7] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#075985] transition-all shadow-lg shadow-[#0284C7]/20 flex items-center gap-2">
                  Shop Medicines <ArrowUpRight size={18} />
                </button>
                <button className="border border-[#0284C7]/30 px-8 py-4 rounded-full font-semibold text-[#082F49] hover:bg-white/60 transition-all">
                  Upload Prescription
                </button>
              </div>

              <div className="flex flex-wrap gap-8 pt-8 border-t border-[#0284C7]/15">
                {[
                  ["85%", "Max Discount"],
                  ["4K+", "Cities Covered"],
                  ["100+", "Diseases Covered"],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-display font-bold text-2xl text-[#082F49]">
                      {val}
                    </div>
                    <div className="text-xs text-[#4B6584] mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <SpecimenChamber />
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="py-10 bg-white/60 border-y border-[#0284C7]/10">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-wrap justify-center items-center gap-10 md:gap-20">
            {certifications.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <Icon size={22} className="text-[#082F49]" strokeWidth={1.8} />
                <span className="font-display font-bold text-sm tracking-tight text-[#082F49]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* INFRASTRUCTURE */}
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
                Our robust cold-chain network ensures temperature-sensitive treatments reach your doorstep with absolute integrity, speed, and reliability &mdash; monitored end to end.
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
              <NetworkGraphic />
            </div>
          </div>
        </section>

        {/* INNOVATIONS -> SERVICES */}
        <section className="py-24 px-6 md:px-16 bg-white/50 border-y border-[#0284C7]/10">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-[12px] tracking-[0.2em] text-[#0284C7] font-medium mb-4 block">
                WHY CHOOSE HEXACARE
              </span>
              <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#082F49] tracking-tight mb-4">
                Patient-first healthcare services
              </h2>
              <p className="text-[#4B6584] text-lg max-w-2xl mx-auto">
                Making critical healthcare accessible through dedicated assistance, authentic sourcing, and advanced medical logistics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {innovations.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex flex-col bg-white rounded-3xl border border-[#0284C7]/10 p-8 hover:shadow-xl hover:shadow-[#0284C7]/10 hover:-translate-y-1 transition-all duration-500"
                >
                  <IconBadge Icon={Icon} />
                  <h3 className="font-display font-bold text-xl text-[#082F49] mt-6 mb-3">
                    {title}
                  </h3>
                  <p className="text-[#4B6584] text-[15px] leading-relaxed flex-1">
                    {desc}
                  </p>
                  <button className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] group-hover:gap-2.5 transition-all">
                    Learn more <ArrowUpRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="py-20 px-6 md:px-16">
          <div className="max-w-[1280px] mx-auto rounded-[2rem] bg-[#082F49] px-8 md:px-16 py-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#0284C7]/20 blur-3xl" />
            <div className="relative">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-3">
                Need help finding a critical medicine?
              </h3>
              <p className="text-[#9DC8E6] max-w-md">
                Connect with our HexaCare support team for guidance on rare imports and specialty prescriptions.
              </p>
            </div>
            <button className="relative bg-white text-[#082F49] px-8 py-4 rounded-full font-semibold hover:bg-[#EAF6FF] transition-colors whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function NetworkGraphic() {
  const nodes: [number, number][] = [
    [40, 60], [140, 30], [230, 80], [310, 40], [70, 160],
    [190, 190], [280, 150], [120, 240], [250, 260], [40, 220],
  ];
  const arcs: [number, number][] = [
    [0, 2], [1, 3], [4, 6], [5, 8], [0, 5], [3, 6], [7, 9], [1, 4],
  ];
  return (
    <div className="relative w-full aspect-[4/3] rounded-3xl bg-white/60 backdrop-blur-md border border-[#0284C7]/10 overflow-hidden float-slow">
      <svg viewBox="0 0 340 300" className="w-full h-full">
        <rect width="340" height="300" fill="none" />
        {arcs.map(([a, b], i) => {
          const [x1, y1] = nodes[a];
          const [x2, y2] = nodes[b];
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 30;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              stroke="#0284C7"
              strokeWidth="1"
              fill="none"
              opacity="0.35"
            />
          );
        })}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 5 : 3} fill={i % 3 === 0 ? "#0284C7" : "#22D3EE"} />
        ))}
      </svg>
      <div className="absolute bottom-5 left-5 font-mono text-[11px] text-[#0284C7]/70 tracking-wider">
        NETWORK.STATUS: ONLINE
      </div>
    </div>
  );
}