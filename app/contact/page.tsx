'use client'
import React, { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import Image from "next/image";
import {
  Clock,
  Globe2,
  Lock,
  Headset,
  Building2,
  PackageSearch,
  MessageSquare,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Snowflake,
  Radar,
  ShieldCheck,
} from "lucide-react";
import BranchNetwork from "@/components/contact/BranchNetwork";

/* ---------- UI Helpers ---------- */
function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
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

/* Card with a cursor-following light — the "spotlight" hover. */
function SpotCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div onMouseMove={onMove} className={`spot-card ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] uppercase font-bold ${dark ? "text-[#22D3EE]" : "text-[#0284C7]"}`}>
      <span className={`h-px w-8 ${dark ? "bg-[#22D3EE]" : "bg-[#0284C7]"}`} />
      {children}
    </span>
  );
}

/* ---------- Data Constants ---------- */
const supportRoutes = [
  { icon: PackageSearch, title: "Patient Support & Orders", desc: "Order tracking, prescription uploads, and PAP inquiries.", email: "support@hexacare.in" },
  { icon: Globe2, title: "Global Sourcing", desc: "For rare, out-of-catalogue, and imported specialty medicines.", email: "sourcing@hexacare.in" },
  { icon: Building2, title: "Partnerships & B2B", desc: "For hospitals, clinics, and pharmaceutical manufacturers.", email: "partners@hexacare.in" },
  { icon: MessageSquare, title: "Media & Press", desc: "For PR inquiries, interviews, and media resources.", email: "press@hexacare.in" }
];

const locations = [
  {
    type: "Head Office",
    city: "Chennai",
    address: "Hexacare Pharmaceuticals Pvt Ltd, Old No.149, New No.50, Ground Floor & 1st Floor, Eldams Road, Teynampet, Chennai 600018."
  },
  {
    type: "Branch Office",
    city: "Coimbatore",
    address: "Hexacare Pharmaceuticals Pvt Ltd, No.475/2, 1st Floor, West face, Pankaja Mill road, Ramasamy nagar, Ramanathapuram, Coimbatore 641045",
    phones: [
      { label: "Office", number: "0422-4954112/13", dial: "04224954112" },
      { label: "Mobile", number: "98848 45804", dial: "+919884845804" }
    ]
  },
  {
    type: "Branch Office",
    city: "Trichy",
    address: "Hexacare Pharmaceuticals Pvt Ltd, NO:D-322, Anna Nagar, 5th cross, Tennur, Trichy 620017"
  },
  {
    type: "Branch Office",
    city: "Madurai",
    address: "Hexacare Pharmaceuticals Pvt Ltd, Door No.16/2 Rathna Towers, First floor, Sakthi Velammal 1st Main(Avenue street), S.S.Colony, Madurai."
  },
  {
    type: "Branch Office",
    city: "Bengaluru",
    address: "Hexacare Pharmaceuticals Pvt Ltd, P.no.2606, No.102, The Ambience 1st floor, 27th Main, 16th cross, 1st sector, HSR Layout, Bengaluru – 560102."
  }
];

const faqs = [
  {
    q: "How do I track my specialty medicine order?",
    a: "You can track your order using the secure portal link sent to your registered mobile/email, or by quoting your Rx Order ID to our 24/7 Patient Coordinator."
  },
  {
    q: "What is your return policy for temperature-sensitive drugs?",
    a: "Due to cold-chain compliance standards, temperature-sensitive specialty medicines cannot be returned once delivered. Please inspect the temperature logs upon delivery."
  },
  {
    q: "How can I verify cold-chain integrity upon delivery?",
    a: "Our logistics team uses real-time IoT temperature monitors. You will be shown the temperature reading log at the time of delivery to confirm the required 2-8°C range."
  },
  {
    q: "Am I eligible for the Patient Assistance Program (PAP)?",
    a: "Eligibility depends on the specific drug manufacturer criteria and clinical/financial evaluation. Our support coordinators can help guide you through the documentation process."
  }
];

const slides = [
  {
    tagline: "Patient Support & Care",
    title: "We are here for you. Every step of the way.",
    accent: "Every step of the way.",
    description: "Whether you need to upload a prescription, track a cold-chain delivery, or speak with our clinical sourcing team, HexaCare is ready to assist.",
    image: "/contact_slider_1.png",
    linkText: "Reach Patient Support",
    linkHref: "#inquiry-form"
  },
  {
    tagline: "Global Clinical Sourcing",
    title: "Connecting India to Life-Saving Therapies.",
    accent: "Life-Saving Therapies.",
    description: "Access rare, import-only, and specialty global medicines. Our sourcing experts assist with regulatory clearances and door-to-door delivery.",
    image: "/contact_slider_2.png",
    linkText: "Request Rare Medicine",
    linkHref: "#inquiry-form"
  },
  {
    tagline: "B2B & Institutional Support",
    title: "Empowering Hospitals & Clinics Nationwide.",
    accent: "Hospitals & Clinics Nationwide.",
    description: "Partner with HexaCare for reliable bulk supplies, temperature-controlled logistics, and complete pharmaceutical distribution solutions.",
    image: "/contact_slider_3.png",
    linkText: "Explore Partnerships",
    linkHref: "#inquiry-form"
  }
];

const departments = [
  { value: "order", label: "Order Tracking & Fulfillment" },
  { value: "pap", label: "Patient Assistance Program (PAP)" },
  { value: "sourcing", label: "Out-of-Catalogue Medicine" },
  { value: "partnership", label: "B2B Partnership / Bulk Order" },
  { value: "other", label: "General Inquiry" }
];

const marquee = ["Cold-Chain Logistics", "Rare Medicine Sourcing", "Patient Assistance Program", "IoT Temperature Tracking", "Regulatory Clearance", "Hospital & Clinic Supply"];

const capabilities = [
  { icon: Snowflake, stat: "2–8°C", title: "Verified Cold-Chain Storage", desc: "Temperature-controlled storage built for specialty healthcare." },
  { icon: Radar, stat: "Live", title: "GPS & IoT Temperature Tracking", desc: "Real-time visibility on every temperature-sensitive shipment." },
  { icon: ShieldCheck, stat: "100%", title: "Dedicated Regulatory Helpdesk", desc: "National coverage with fully compliant clearance support." }
];

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [inquiryType, setInquiryType] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoplay]);

  const goTo = (idx: number) => {
    setCurrentSlide((idx + slides.length) % slides.length);
    setIsAutoplay(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate API call
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen w-full bg-[#EAF6FF] text-[#0B2545] overflow-x-clip font-sans relative">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes hx-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes hx-marquee { to { transform: translateX(-50%); } }
        @keyframes hx-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes hx-shimmer { to { transform: translateX(260%); } }
        @keyframes hx-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-20px); } }

        .hex-bg {
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='104' viewBox='0 0 60 104'><g fill='none' stroke='%2322D3EE' stroke-opacity='0.10'><path d='M30 0l30 17v34L30 68 0 51V17z'/><path d='M30 68l30 17v19M30 68L0 85v19'/></g></svg>");
          background-size: 60px 104px;
        }
        .grain::after {
          content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .06; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
        }
        .chamfer { clip-path: polygon(0 0, calc(100% - 56px) 0, 100% 56px, 100% 100%, 56px 100%, 0 calc(100% - 56px)); }
        .text-shine { background: linear-gradient(100deg,#22D3EE,#7DD3FC 40%,#ffffff 60%,#22D3EE); -webkit-background-clip: text; background-clip: text; color: transparent; }

        .spot-card { position: relative; overflow: hidden; }
        .spot-card::before {
          content: ""; position: absolute; inset: 0; opacity: 0; transition: opacity .4s; pointer-events: none;
          background: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(34,211,238,.18), transparent 60%);
        }
        .spot-card:hover::before { opacity: 1; }

        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ""; position: absolute; top: 0; left: -60%; width: 40%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform: skewX(-20deg); }
        .btn-shine:hover::after { animation: hx-shimmer .9s ease-out; }

        .field { width: 100%; background: transparent; border: 0; border-bottom: 1px solid rgba(8,47,73,.2); padding: .9rem 0 .6rem; outline: none; font-size: .95rem; color: #082F49; transition: border-color .25s; }
        .field::placeholder { color: #8aa4bb; }
        .field:focus { border-bottom-color: #0284C7; box-shadow: 0 1px 0 0 #0284C7; }

        @media (prefers-reduced-motion: reduce) {
          .hx-anim, .btn-shine:hover::after { animation: none !important; }
        }
      `}</style>

      {/* ============ 1. HERO ============ */}
      <section className="relative isolate bg-[#041B2D] text-white pt-36 pb-24 lg:pt-44 lg:pb-32 px-6 md:px-16 overflow-hidden grain">
        <div className="absolute inset-0 hex-bg [mask-image:radial-gradient(ellipse_at_60%_40%,black,transparent_75%)] -z-10" />
        <div className="hx-anim absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-[#0284C7]/30 blur-[120px] -z-10 animate-[hx-drift_14s_ease-in-out_infinite]" />
        <div className="hx-anim absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full bg-[#22D3EE]/15 blur-[110px] -z-10 animate-[hx-drift_18s_ease-in-out_infinite_reverse]" />

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-12 gap-14 lg:gap-8 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-md mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-70 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22D3EE]" />
              </span>
              <Headset size={14} className="text-[#22D3EE]" />
              <span key={currentSlide} className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#BFE3F7] animate-[fadeUp_.5s_ease-out]">
                {slide.tagline}
              </span>
            </div>

            {/* Stacked slides share one grid cell, so height always fits the longest */}
            <div className="grid">
              {slides.map((s, idx) => {
                const [lead] = s.title.split(s.accent);
                return (
                  <div
                    key={idx}
                    aria-hidden={idx !== currentSlide}
                    className={`col-start-1 row-start-1 transition-all duration-700 ${idx === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}
                  >
                    {idx === currentSlide ? (
                      <h1 className="font-display font-extrabold text-[2.5rem] sm:text-5xl lg:text-[3.6rem] leading-[1.06] tracking-[-0.02em]">
                        {lead}
                        <span className="text-shine">{s.accent}</span>
                      </h1>
                    ) : (
                      <p className="font-display font-extrabold text-[2.5rem] sm:text-5xl lg:text-[3.6rem] leading-[1.06] tracking-[-0.02em]">{s.title}</p>
                    )}
                    <p className="mt-6 text-base sm:text-lg text-[#9DC8E6] leading-relaxed max-w-xl">{s.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a
                href={slide.linkHref}
                className="btn-shine inline-flex items-center gap-3 bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] text-[#041B2D] pl-7 pr-3 py-3 rounded-full font-bold shadow-[0_10px_40px_-10px_rgba(34,211,238,.7)] hover:shadow-[0_14px_50px_-8px_rgba(34,211,238,.9)] transition-shadow cursor-pointer"
              >
                {slide.linkText}
                <span className="w-9 h-9 rounded-full bg-[#041B2D] text-[#22D3EE] flex items-center justify-center"><ArrowRight size={16} /></span>
              </a>

              <div className="flex gap-2">
                <button onClick={() => goTo(currentSlide - 1)} className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 backdrop-blur flex items-center justify-center transition-colors cursor-pointer" aria-label="Previous slide">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => goTo(currentSlide + 1)} className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 backdrop-blur flex items-center justify-center transition-colors cursor-pointer" aria-label="Next slide">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Segmented progress */}
            <div className="mt-10 flex gap-3 max-w-md">
              {slides.map((s, idx) => (
                <button key={idx} onClick={() => goTo(idx)} aria-label={`Go to slide ${idx + 1}: ${s.tagline}`} className="group flex-1 py-3 cursor-pointer text-left">
                  <span className="block h-[3px] rounded-full bg-white/15 overflow-hidden">
                    <span
                      key={idx === currentSlide ? `a${currentSlide}` : `i${idx}`}
                      className={`hx-anim block h-full origin-left bg-[#22D3EE] ${idx < currentSlide || (idx === currentSlide && !isAutoplay) ? "scale-x-100" : idx === currentSlide ? "animate-[hx-progress_6s_linear_forwards]" : "scale-x-0"}`}
                    />
                  </span>
                  <span className={`mt-2 block font-mono text-[10px] tracking-widest uppercase transition-colors ${idx === currentSlide ? "text-[#22D3EE]" : "text-white/35 group-hover:text-white/60"}`}>
                    0{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[560px] lg:max-w-none">
              <div className="absolute -inset-3 chamfer bg-gradient-to-br from-[#22D3EE]/60 via-[#0284C7]/20 to-transparent" />
              <div className="relative chamfer aspect-[4/4.4] sm:aspect-[4/3.7] bg-[#06263B] overflow-hidden">
                {slides.map((s, idx) => (
                  <Image
                    key={s.image}
                    src={s.image}
                    alt={s.title}
                    fill
                    priority={idx === 0}
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className={`object-cover transition-all duration-[1400ms] ease-out ${idx === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"}`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#041B2D]/70 via-transparent to-[#0284C7]/10" />
              </div>

              {/* Floating glass chips */}
              <div className="hx-anim absolute -left-4 sm:-left-10 bottom-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-2xl animate-[hx-float_6s_ease-in-out_infinite]">
                <div className="font-display font-extrabold text-2xl leading-none">24/7</div>
                <div className="text-[10px] uppercase tracking-widest text-[#BFE3F7] mt-1.5">Patient Coordinator</div>
              </div>
              <div className="hx-anim absolute -right-2 sm:-right-6 top-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-2xl animate-[hx-float_7s_ease-in-out_infinite_reverse]">
                <div className="font-display font-extrabold text-2xl leading-none text-[#22D3EE]">2–8°C</div>
                <div className="text-[10px] uppercase tracking-widest text-[#BFE3F7] mt-1.5">Cold-chain assured</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. MARQUEE ============ */}
      <div className="relative bg-[#0284C7] text-white overflow-hidden border-y border-white/10" aria-hidden="true">
        <div className="hx-anim flex w-max animate-[hx-marquee_38s_linear_infinite] py-4">
          {[...marquee, ...marquee, ...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-6 pr-6 text-sm font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
              {m}
              <svg width="14" height="14" viewBox="-7 -7 14 14"><polygon points="7,0 3.5,6.06 -3.5,6.06 -7,0 -3.5,-6.06 3.5,-6.06" fill="#22D3EE" /></svg>
            </span>
          ))}
        </div>
      </div>

      {/* ============ 3. ROUTED SUPPORT ============ */}
      <section className="py-24 px-6 md:px-16 relative">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Eyebrow>Direct Lines</Eyebrow>
              <h2 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-[#082F49] leading-[1.1] tracking-tight">
                The right team,<br />first time.
              </h2>
            </div>
            <p className="text-[#4B6584] max-w-sm leading-relaxed">Skip the queue. Each inbox is staffed by specialists who handle exactly that request.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {supportRoutes.map((route, i) => (
              <Reveal key={route.title} delay={i * 100} className="h-full">
                <SpotCard className="group h-full rounded-[2rem] bg-white border border-[#0284C7]/10 p-8 flex flex-col shadow-[0_1px_0_rgba(255,255,255,.8)_inset,0_20px_50px_-30px_rgba(2,132,199,.35)] hover:-translate-y-1.5 hover:border-[#0284C7]/40 hover:shadow-[0_30px_60px_-25px_rgba(2,132,199,.5)] transition-all duration-500">
                  <div className="flex items-start justify-between mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#082F49] to-[#0284C7] text-[#22D3EE] flex items-center justify-center shadow-lg shadow-[#0284C7]/30 group-hover:rotate-[-6deg] group-hover:scale-105 transition-transform duration-500">
                      <route.icon size={24} strokeWidth={1.7} />
                    </div>
                    <span className="font-mono text-xs text-[#0284C7]/40 font-bold tracking-widest">0{i + 1}</span>
                  </div>
                  <h3 className="font-display font-bold text-[#082F49] text-xl leading-snug mb-3">{route.title}</h3>
                  <p className="text-[#4B6584] text-sm leading-relaxed mb-8 flex-grow">{route.desc}</p>
                  <a href={`mailto:${route.email}`} className="relative flex items-center justify-between gap-3 pt-5 border-t border-[#0284C7]/10 text-[#0284C7] font-semibold text-sm">
                    <span className="truncate">{route.email}</span>
                    <span className="w-9 h-9 shrink-0 rounded-full border border-[#0284C7]/25 flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white group-hover:border-[#0284C7] transition-all">
                      <ArrowUpRight size={16} />
                    </span>
                  </a>
                </SpotCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. INQUIRY FORM & FAQs ============ */}
      <section id="inquiry-form" className="relative isolate bg-[#041B2D] py-24 lg:py-28 px-6 md:px-16 scroll-mt-0 overflow-hidden grain">
        <div className="absolute inset-0 hex-bg [mask-image:radial-gradient(ellipse_at_20%_30%,black,transparent_70%)] -z-10" />
        <div className="absolute -bottom-40 left-1/3 w-[520px] h-[520px] rounded-full bg-[#0284C7]/25 blur-[120px] -z-10" />

        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Secure Form */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="rounded-[2.5rem] bg-gradient-to-b from-white to-[#F2FAFF] p-8 sm:p-12 shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)] relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#22D3EE]/20 blur-3xl pointer-events-none" />
                <div className="relative flex items-center justify-between mb-8">
                  <Eyebrow>Secure Inquiry</Eyebrow>
                  <span className="inline-flex items-center gap-2 text-[#0284C7] bg-[#0284C7]/10 px-3 py-1.5 rounded-full">
                    <Lock size={13} />
                    <span className="font-mono text-[10px] tracking-widest font-bold">ENCRYPTED</span>
                  </span>
                </div>

                <h2 className="relative font-display font-extrabold text-3xl sm:text-4xl text-[#082F49] tracking-tight mb-3">Tell us how we can help.</h2>
                <p className="relative text-[#4B6584] text-sm leading-relaxed mb-10 max-w-lg">Your medical data and personal details are encrypted and kept strictly confidential. We never share patient information.</p>

                {formStatus === "success" ? (
                  <div className="relative bg-emerald-50 border border-emerald-200 p-10 rounded-3xl text-center animate-[fadeUp_.6s_ease-out]">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-emerald-800 mb-2">Inquiry Received</h3>
                    <p className="text-emerald-700 text-sm">A HexaCare representative will contact you securely within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative space-y-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                      <div>
                        <label htmlFor="c-name" className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#0284C7]">Full Name</label>
                        <input id="c-name" type="text" required autoComplete="name" className="field" placeholder="John Doe" />
                      </div>
                      <div>
                        <label htmlFor="c-phone" className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#0284C7]">Phone Number</label>
                        <input id="c-phone" type="tel" required autoComplete="tel" className="field" placeholder="+91" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="c-email" className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#0284C7]">Email Address</label>
                      <input id="c-email" type="email" required autoComplete="email" className="field" placeholder="john@example.com" />
                    </div>

                    <fieldset>
                      <legend className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#0284C7] mb-3">Subject of Inquiry</legend>
                      <div className="flex flex-wrap gap-2.5">
                        {departments.map((d, i) => (
                          <label key={d.value} className="cursor-pointer">
                            <input
                              type="radio"
                              name="department"
                              value={d.value}
                              required={i === 0}
                              checked={inquiryType === d.value}
                              onChange={(e) => setInquiryType(e.target.value)}
                              className="peer sr-only"
                            />
                            <span className="block px-4 py-2.5 rounded-full border border-[#082F49]/15 text-sm font-medium text-[#4B6584] bg-white transition-all hover:border-[#0284C7]/50 peer-checked:bg-[#082F49] peer-checked:text-white peer-checked:border-[#082F49] peer-checked:shadow-lg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0284C7]">
                              {d.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="c-msg" className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#0284C7]">Message Details</label>
                      <textarea id="c-msg" required rows={4} className="field resize-none" placeholder="Please provide details about your prescription or inquiry..." />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="btn-shine group w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-[#082F49] text-white pl-8 pr-3 py-3 rounded-full font-bold hover:bg-[#0284C7] transition-colors disabled:opacity-70 cursor-pointer"
                    >
                      {formStatus === "submitting" ? "Encrypting & Sending..." : "Submit Inquiry"}
                      <span className="w-10 h-10 rounded-full bg-[#22D3EE] text-[#041B2D] flex items-center justify-center group-hover:rotate-45 transition-transform duration-300"><ArrowRight size={18} /></span>
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right: FAQs */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal delay={150}>
              <Eyebrow dark>Quick Answers</Eyebrow>
              <h3 className="mt-4 mb-8 font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-3">
                <Clock size={26} className="text-[#22D3EE]" /> Before you write
              </h3>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] backdrop-blur-xl divide-y divide-white/10 overflow-hidden">
                {faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div key={i} className={`transition-colors ${isOpen ? "bg-white/[0.06]" : ""}`}>
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="w-full text-left flex items-center gap-4 px-6 py-5 text-white hover:text-[#22D3EE] font-semibold transition-colors cursor-pointer"
                      >
                        <span className="font-mono text-xs text-[#22D3EE]/70">0{i + 1}</span>
                        <span className="flex-1 text-[15px] leading-snug">{faq.q}</span>
                        <Plus size={18} className={`shrink-0 text-[#22D3EE] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                      </button>
                      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <p className="px-6 pb-6 pl-[3.75rem] text-sm text-[#9DC8E6] leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 5. CORPORATE FOOTPRINT ============ */}
      <section className="py-24 lg:py-28 px-6 md:px-16 relative">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="mb-14">
            <Eyebrow>Corporate Footprint</Eyebrow>
            <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-[#082F49] leading-[1.1] tracking-tight">
                Our Administrative &amp;<br />Logistics Network
              </h2>
              <div className="flex items-end gap-6">
                <div className="font-display font-extrabold text-7xl lg:text-8xl leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#0284C7] to-[#0284C7]/10">05</div>
                <p className="text-sm sm:text-base text-[#4B6584] max-w-xs leading-relaxed pb-2">
                  HexaCare operates across strategically located pharmaceutical distribution hubs to guarantee temperature-controlled cold-chain logistics and immediate drug access.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <BranchNetwork branches={locations} />
          </Reveal>

          <div className="mt-16">
            <Reveal className="mb-8">
              <h3 className="font-display font-bold text-xl text-[#082F49]">Strategic Logistics Capability</h3>
              <p className="text-sm text-[#4B6584] mt-1">Our network is built specifically to address the complex requirements of specialty healthcare logistics.</p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {capabilities.map((c, i) => (
                <Reveal key={c.title} delay={i * 120} className="h-full">
                  <SpotCard className="group h-full rounded-[2rem] bg-white border border-[#0284C7]/10 p-8 hover:border-[#0284C7]/40 hover:-translate-y-1 transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                      <c.icon size={26} strokeWidth={1.6} className="text-[#0284C7]" />
                      <span className="font-display font-extrabold text-3xl text-[#082F49] group-hover:text-[#0284C7] transition-colors">{c.stat}</span>
                    </div>
                    <h4 className="font-display font-bold text-[#082F49] mb-2">{c.title}</h4>
                    <p className="text-sm text-[#4B6584] leading-relaxed">{c.desc}</p>
                  </SpotCard>
                </Reveal>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-[#4B6584] border-t border-[#0284C7]/15 pt-5">
              <span>National Coverage</span>
              <span className="font-bold text-[#0284C7] uppercase tracking-wider font-mono">100% Compliant</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
