'use client'
import React, { useEffect, useRef, useState, type ReactNode, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  MapPin,
  Clock,
  Globe2,
  Lock,
  Headset,
  Building2,
  PackageSearch,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";


type IconType = ComponentType<LucideProps>;

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
    address: "Hexacare Pharmaceuticals Pvt Ltd, No.475/2, 1st Floor, West face, Pankaja Mill road, Ramasamy nagar, Ramanathapuram, Coimbatore 641045"
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
    description: "Whether you need to upload a prescription, track a cold-chain delivery, or speak with our clinical sourcing team, HexaCare is ready to assist.",
    image: "/contact_slider_1.png",
    linkText: "Reach Patient Support",
    linkHref: "#inquiry-form"
  },
  {
    tagline: "Global Clinical Sourcing",
    title: "Connecting India to Life-Saving Therapies.",
    description: "Access rare, import-only, and specialty global medicines. Our sourcing experts assist with regulatory clearances and door-to-door delivery.",
    image: "/contact_slider_2.png",
    linkText: "Request Rare Medicine",
    linkHref: "#inquiry-form"
  },
  {
    tagline: "B2B & Institutional Support",
    title: "Empowering Hospitals & Clinics Nationwide.",
    description: "Partner with HexaCare for reliable bulk supplies, temperature-controlled logistics, and complete pharmaceutical distribution solutions.",
    image: "/contact_slider_3.png",
    linkText: "Explore Partnerships",
    linkHref: "#inquiry-form"
  }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    // Simulate API call
    setTimeout(() => {
      setFormStatus("success");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#EAF6FF] text-[#0B2545] overflow-x-hidden font-sans relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(2,132,199,0.15); }
        .input-field { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid rgba(2,132,199,0.2); background: white; outline: none; transition: border-color 0.2s; font-size: 0.875rem; }
        .input-field:focus { border-color: #0284C7; box-shadow: 0 0 0 3px rgba(2,132,199,0.1); }
      `}</style>



      {/* ============ 1. HERO SECTION (BANNER SLIDER) ============ */}
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-16 px-6 md:px-16 overflow-hidden z-10">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <div className="glass-panel overflow-hidden rounded-3xl shadow-2xl relative min-h-[550px] lg:min-h-[480px] flex flex-col lg:flex-row">
              {/* Left Column: Content (acts as text overlay on mobile, glass split column on desktop) */}
              <div className="absolute inset-0 lg:relative lg:inset-auto w-full h-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 bg-gradient-to-t from-[#082F49]/95 via-[#082F49]/75 to-[#082F49]/40 lg:bg-none lg:bg-white/40 lg:backdrop-blur-md">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 lg:border-[#0284C7]/20 bg-[#082F49]/80 lg:bg-white/80 backdrop-blur-md mb-6 shadow-sm">
                    <Headset size={16} className="text-[#22D3EE] lg:text-[#0284C7]" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#22D3EE] lg:text-[#0284C7]">
                      {slides[currentSlide].tagline}
                    </span>
                  </div>
                  
                  {/* Slider Content Transitions */}
                  <div className="relative min-h-[280px] sm:min-h-[200px] lg:min-h-[240px]">
                    {slides.map((slide, idx) => (
                      <div
                        key={idx}
                        className={`transition-all duration-700 absolute inset-0 ${idx === currentSlide
                            ? "opacity-100 translate-x-0 pointer-events-auto"
                            : "opacity-0 translate-x-8 pointer-events-none"
                          }`}
                      >
                        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[44px] text-white lg:text-[#082F49] leading-[1.2] tracking-tight mb-4">
                          {slide.title}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-200 lg:text-[#4B6584] leading-relaxed max-w-xl">
                          {slide.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {/* Action CTA */}
                  <a
                    href={slides[currentSlide].linkHref}
                    className="inline-flex items-center justify-center gap-2 bg-white lg:bg-[#082F49] hover:bg-[#22D3EE] lg:hover:bg-[#0284C7] text-[#082F49] lg:text-white hover:text-[#082F49] lg:hover:text-white px-6 py-3 rounded-xl font-bold transition-all w-fit shadow-md hover:shadow-lg"
                  >
                    {slides[currentSlide].linkText} <ArrowRight size={18} />
                  </a>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-4">
                    {/* Dots / Indicators */}
                    <div className="flex gap-2">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentSlide(idx);
                            setIsAutoplay(false);
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-[#22D3EE] lg:bg-[#0284C7]" : "w-2 bg-white/30 lg:bg-[#0284C7]/20 hover:bg-white/50 lg:hover:bg-[#0284C7]/40"
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Arrow buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                          setIsAutoplay(false);
                        }}
                        className="w-10 h-10 rounded-xl bg-[#082F49]/60 lg:bg-white border border-white/10 lg:border-[#0284C7]/20 text-white lg:text-[#082F49] flex items-center justify-center hover:bg-[#082F49] lg:hover:bg-white/80 transition-all shadow-sm"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentSlide((prev) => (prev + 1) % slides.length);
                          setIsAutoplay(false);
                        }}
                        className="w-10 h-10 rounded-xl bg-[#082F49]/60 lg:bg-white border border-white/10 lg:border-[#0284C7]/20 text-white lg:text-[#082F49] flex items-center justify-center hover:bg-[#082F49] lg:hover:bg-white/80 transition-all shadow-sm"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Image Banner (absolute full screen underlay on mobile, standard column on desktop) */}
              <div className="absolute inset-0 w-full h-full lg:relative lg:w-1/2 lg:h-auto z-0 overflow-hidden bg-[#082F49]/10">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                  >
                    {/* Decorative overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent lg:from-white/30 z-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#EAF6FF]/20 to-transparent z-20 pointer-events-none" />
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${idx === currentSlide ? "scale-105" : "scale-100"
                        }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 2. ROUTED SUPPORT GRID ============ */}
      <section className="py-12 px-6 md:px-16 z-10 relative">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportRoutes.map((route, i) => (
              <Reveal key={route.title} delay={i * 100}>
                <div className="glass-panel p-6 sm:p-8 rounded-3xl h-full flex flex-col hover:border-[#0284C7]/40 hover:shadow-xl transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center mb-5 group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                    <route.icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-display font-bold text-[#082F49] text-lg mb-2">{route.title}</h3>
                  <p className="text-[#4B6584] text-sm leading-relaxed mb-6 flex-grow">{route.desc}</p>
                  <a href={`mailto:${route.email}`} className="text-[#0284C7] font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    {route.email} <ArrowRight size={16} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. INQUIRY FORM & FAQs ============ */}
      <section id="inquiry-form" className="py-16 px-6 md:px-16 z-10 relative scroll-mt-24">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Secure Form */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 flex items-center gap-2 text-[#0284C7]/80">
                  <Lock size={16} />
                  <span className="font-mono text-[10px] tracking-widest font-bold">SECURE CHANNEL</span>
                </div>

                <h2 className="font-display font-bold text-3xl text-[#082F49] mb-2">Secure Inquiry</h2>
                <p className="text-[#4B6584] text-sm mb-8">Your medical data and personal details are encrypted and kept strictly confidential. We never share patient information.</p>

                {formStatus === "success" ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-emerald-800 mb-2">Inquiry Received</h3>
                    <p className="text-emerald-700 text-sm">A HexaCare representative will contact you securely within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#082F49] ml-1">Full Name</label>
                        <input type="text" required className="input-field" placeholder="John Doe" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-[#082F49] ml-1">Phone Number</label>
                        <input type="tel" required className="input-field" placeholder="+91" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#082F49] ml-1">Email Address</label>
                      <input type="email" required className="input-field" placeholder="john@example.com" />
                    </div>

                    <div className="space-y-1 relative">
                      <label className="text-xs font-semibold text-[#082F49] ml-1">Subject of Inquiry</label>
                      <div className="relative">
                        <select
                          required
                          className="input-field appearance-none cursor-pointer text-[#4B6584]"
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                        >
                          <option value="" disabled>Select a department...</option>
                          <option value="order">Order Tracking & Fulfillment</option>
                          <option value="pap">Patient Assistance Program (PAP)</option>
                          <option value="sourcing">Request Out-of-Catalogue Medicine</option>
                          <option value="partnership">B2B Partnership / Bulk Order</option>
                          <option value="other">General Inquiry</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0284C7] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#082F49] ml-1">Message Details</label>
                      <textarea required rows={4} className="input-field resize-none" placeholder="Please provide details about your prescription or inquiry..." />
                    </div>

                    <button
                      type="submit"
                      disabled={formStatus === "submitting"}
                      className="w-full bg-[#082F49] text-white py-4 rounded-xl font-bold hover:bg-[#0284C7] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {formStatus === "submitting" ? "Encrypting & Sending..." : "Submit Inquiry"}
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* Right: FAQs & Grievance */}
          <div className="lg:col-span-5 space-y-8">
            <Reveal delay={150}>
              <div className="glass-panel p-8 rounded-[2rem]">
                <h3 className="font-display font-bold text-xl text-[#082F49] mb-6 flex items-center gap-3">
                  <Clock size={20} className="text-[#0284C7]" /> Quick Answers
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, i) => {
                    const isOpen = openFaqIndex === i;
                    return (
                      <div
                        key={i}
                        className={`pb-4 transition-all ${
                          i === faqs.length - 1 ? "" : "border-b border-[#0284C7]/15"
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                          className="w-full text-left flex items-center justify-between gap-4 text-[#082F49] hover:text-[#0284C7] font-semibold text-base transition-colors py-2 focus:outline-none cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <ChevronDown
                            size={18}
                            className={`text-[#0284C7] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${isOpen
                              ? "grid-rows-[1fr] opacity-100 mt-2"
                              : "grid-rows-[0fr] opacity-0"
                            }`}
                        >
                          <div className="overflow-hidden text-sm text-[#4B6584] leading-relaxed">
                            {faq.a}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ============ 4. CORPORATE FOOTPRINT ============ */}
      <section className="py-20 px-6 md:px-16 z-10 relative border-t border-[#0284C7]/10 bg-gradient-to-b from-transparent to-[#EAF6FF]/40">
        <div className="max-w-[1280px] mx-auto">
          <Reveal className="mb-12">
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#0284C7] uppercase font-bold block mb-3">
              Corporate Footprint
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#082F49] leading-tight">
                Our Administrative &<br />Logistics Network
              </h2>
              <p className="text-sm sm:text-base text-[#4B6584] max-w-md leading-relaxed">
                HexaCare operates across strategically located pharmaceutical distribution hubs to guarantee temperature-controlled cold-chain logistics and immediate drug access.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Head Office Chennai - Highlight Card */}
            <Reveal className="md:col-span-2 lg:col-span-2" delay={100}>
              <div className="bg-[#082F49] text-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-[#0284C7]/20 h-full flex flex-col justify-between group hover:border-[#0284C7]/40 transition-all duration-300">
                {/* Visual decorative accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#0284C7]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#22D3EE]/5 rounded-full blur-2xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#22D3EE] px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                      {locations[0].type}
                    </span>
                    <MapPin className="text-[#22D3EE] animate-pulse" size={28} />
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
                    {locations[0].city}
                  </h3>
                  <p className="text-sm sm:text-base text-[#9DC8E6] leading-relaxed max-w-md mb-8">
                    {locations[0].address}
                  </p>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(locations[0].address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#22D3EE] hover:text-white transition-colors w-fit group/btn cursor-pointer"
                >
                  View Location <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </Reveal>

            {/* 2. Branch Offices (Coimbatore, Trichy) */}
            {locations.slice(1, 3).map((loc, i) => (
              <Reveal key={loc.city} delay={(i + 2) * 100}>
                <div className="bg-white/60 backdrop-blur border border-[#0284C7]/15 p-8 rounded-[2rem] flex flex-col justify-between h-full hover:bg-white hover:border-[#0284C7]/30 transition-all duration-300 shadow-sm hover:shadow-md group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0284C7]/80">
                        {loc.type}
                      </span>
                      <MapPin className="text-[#0284C7] opacity-60 group-hover:opacity-100 transition-opacity" size={22} />
                    </div>
                    <h4 className="font-display font-bold text-[#082F49] text-xl mb-3">{loc.city}</h4>
                    <p className="text-xs sm:text-sm text-[#4B6584] leading-relaxed mb-6">{loc.address}</p>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#082F49] transition-colors w-fit cursor-pointer"
                  >
                    View Location <ArrowRight size={12} />
                  </a>
                </div>
              </Reveal>
            ))}

            {/* 3. Branch Offices (Madurai, Bengaluru) */}
            {locations.slice(3, 5).map((loc, i) => (
              <Reveal key={loc.city} delay={(i + 4) * 100}>
                <div className="bg-white/60 backdrop-blur border border-[#0284C7]/15 p-8 rounded-[2rem] flex flex-col justify-between h-full hover:bg-white hover:border-[#0284C7]/30 transition-all duration-300 shadow-sm hover:shadow-md group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0284C7]/80">
                        {loc.type}
                      </span>
                      <MapPin className="text-[#0284C7] opacity-60 group-hover:opacity-100 transition-opacity" size={22} />
                    </div>
                    <h4 className="font-display font-bold text-[#082F49] text-xl mb-3">{loc.city}</h4>
                    <p className="text-xs sm:text-sm text-[#4B6584] leading-relaxed mb-6">{loc.address}</p>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] hover:text-[#082F49] transition-colors w-fit cursor-pointer"
                  >
                    View Location <ArrowRight size={12} />
                  </a>
                </div>
              </Reveal>
            ))}

            {/* 4. Strategic Network Capabilities Card */}
            <Reveal className="md:col-span-2 lg:col-span-2" delay={600}>
              <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] shadow-lg border border-[#0284C7]/20 h-full flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/90 to-[#EAF6FF]/60">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0284C7]/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <h4 className="font-display font-bold text-[#082F49] text-lg mb-4">Strategic Logistics Capability</h4>
                  <p className="text-xs sm:text-sm text-[#4B6584] leading-relaxed mb-6">
                    Our network is built specifically to address the complex requirements of specialty healthcare logistics.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#082F49]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" /> Verified Cold-Chain Storage (2°C - 8°C)
                    </li>
                    <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#082F49]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" /> Real-time GPS & IoT Temperature Tracking
                    </li>
                    <li className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#082F49]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" /> Dedicated Regulatory Clearance Helpdesk
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-4 border-t border-[#0284C7]/10 flex items-center justify-between text-xs text-[#4B6584]">
                  <span>National Coverage</span>
                  <span className="font-bold text-[#0284C7] uppercase tracking-wider font-mono">100% Compliant</span>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

    </div>
  );
}