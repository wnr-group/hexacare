'use client'
import { useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";

export interface Branch {
  type: string;
  city: string;
  address: string;
}

/* Real-world lat/lon, projected onto the SVG canvas below. */
const COORDS: Record<string, { lat: number; lon: number }> = {
  Chennai: { lat: 13.08, lon: 80.27 },
  Bengaluru: { lat: 12.97, lon: 77.59 },
  Coimbatore: { lat: 11.0, lon: 76.96 },
  Trichy: { lat: 10.8, lon: 78.69 },
  Madurai: { lat: 9.92, lon: 78.12 },
};

const W = 600;
const H = 540;
const project = (city: string) => {
  const { lat, lon } = COORDS[city];
  return { x: 40 + (lon - 76.5) * 120, y: 40 + (13.4 - lat) * 120 };
};

/* Flat-top hexagon centred on 0,0 — echoes the Hexa in HexaCare. */
const hex = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

export default function BranchNetwork({ branches }: { branches: Branch[] }) {
  const hub = branches[0];
  const [active, setActive] = useState(hub.city);
  const current = branches.find((b) => b.city === active) ?? hub;
  const hubPt = project(hub.city);

  return (
    <div className="grid lg:grid-cols-12 gap-6 items-stretch">
      <style>{`
        @keyframes hx-flow { to { stroke-dashoffset: -28; } }
        @keyframes hx-ping { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(2.4); opacity: 0; } }
        .hx-route { stroke-dasharray: 4 10; animation: hx-flow 1.6s linear infinite; }
        .hx-ping { transform-box: fill-box; transform-origin: center; animation: hx-ping 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .hx-route, .hx-ping { animation: none; } }
      `}</style>

      {/* ---- Constellation map ---- */}
      <div className="lg:col-span-7 relative overflow-hidden rounded-[2.5rem] bg-[#06263B] border border-[#0284C7]/25 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#0284C7]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-[#22D3EE]/10 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between px-7 pt-6">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#22D3EE] uppercase font-bold">
            Cold-chain constellation
          </span>
          <span className="text-[10px] tracking-widest text-[#9DC8E6]/70 uppercase">
            {branches.length} hubs · South India
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="relative w-full h-auto"
          role="group"
          aria-label="Map of HexaCare offices across South India, with the Chennai head office connected to each branch"
        >
          <defs>
            <pattern id="hexgrid" width="34.6" height="60" patternUnits="userSpaceOnUse" patternTransform="scale(0.7)">
              <polygon points="17.3,0 34.6,10 34.6,30 17.3,40 0,30 0,10" fill="none" stroke="#22D3EE" strokeOpacity="0.09" />
              <polygon points="34.6,30 51.9,40 51.9,60 34.6,70 17.3,60 17.3,40" fill="none" stroke="#22D3EE" strokeOpacity="0.09" />
            </pattern>
            <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#22D3EE" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <radialGradient id="vignette" cx="50%" cy="50%" r="60%">
              <stop offset="0.5" stopColor="#06263B" stopOpacity="0" />
              <stop offset="1" stopColor="#06263B" stopOpacity="1" />
            </radialGradient>
          </defs>

          <rect width={W} height={H} fill="url(#hexgrid)" />
          <rect width={W} height={H} fill="url(#vignette)" />

          <text x="545" y="250" fill="#9DC8E6" fillOpacity="0.28" fontSize="11" letterSpacing="4" textAnchor="middle" transform="rotate(90 545 250)">
            BAY OF BENGAL
          </text>
          <text x="30" y="500" fill="#9DC8E6" fillOpacity="0.28" fontSize="11" letterSpacing="4">
            ARABIAN SEA
          </text>

          {/* Routes from the head office */}
          {branches.slice(1).map((b) => {
            const p = project(b.city);
            const mx = (hubPt.x + p.x) / 2;
            const my = (hubPt.y + p.y) / 2;
            const dx = p.x - hubPt.x;
            const dy = p.y - hubPt.y;
            const cx = mx - dy * 0.18;
            const cy = my + dx * 0.18;
            const on = active === b.city;
            return (
              <path
                key={b.city}
                d={`M${hubPt.x},${hubPt.y} Q${cx},${cy} ${p.x},${p.y}`}
                fill="none"
                stroke="url(#route)"
                strokeWidth={on ? 2.2 : 1.2}
                strokeOpacity={on ? 1 : 0.4}
                className="hx-route"
                style={{ transition: "stroke-width .3s, stroke-opacity .3s" }}
              />
            );
          })}

          {/* Hex pins */}
          {branches.map((b) => {
            const p = project(b.city);
            const isHub = b === hub;
            const on = active === b.city;
            const r = isHub ? 22 : 15;
            const labelLeft = b.city === "Chennai";
            return (
              <g
                key={b.city}
                transform={`translate(${p.x} ${p.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${b.city} ${b.type}`}
                aria-pressed={on}
                onClick={() => setActive(b.city)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(b.city);
                  }
                }}
                className="cursor-pointer outline-none group"
              >
                {on && <polygon points={hex(r)} fill="#22D3EE" className="hx-ping" />}
                <polygon points={hex(r + 9)} fill="transparent" />
                <polygon
                  points={hex(r)}
                  fill={on || isHub ? "#22D3EE" : "#0B3A57"}
                  stroke="#22D3EE"
                  strokeWidth={on ? 2 : 1.2}
                  className="transition-all duration-300 group-hover:fill-[#22D3EE] group-focus-visible:stroke-white group-focus-visible:stroke-[3]"
                />
                <polygon points={hex(r * 0.45)} fill={on || isHub ? "#06263B" : "#22D3EE"} className="transition-colors duration-300 group-hover:fill-[#06263B]" />
                <text
                  x={labelLeft ? -r - 12 : r + 12}
                  y={4}
                  textAnchor={labelLeft ? "end" : "start"}
                  fill={on ? "#FFFFFF" : "#BFE3F7"}
                  fontSize={isHub ? 15 : 13}
                  fontWeight={700}
                  className="pointer-events-none select-none"
                >
                  {b.city}
                </text>
                {isHub && (
                  <text
                    x={-r - 12}
                    y={20}
                    textAnchor="end"
                    fill="#22D3EE"
                    fontSize="9"
                    letterSpacing="2.5"
                    fontWeight={700}
                    className="pointer-events-none select-none"
                  >
                    HEAD OFFICE
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ---- Detail panel ---- */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10 shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden">
          <svg className="absolute -top-8 -right-8 w-44 h-44 opacity-[0.07] pointer-events-none" viewBox="-30 -30 60 60" aria-hidden="true">
            <polygon points={hex(28)} fill="#0284C7" />
          </svg>

          <div key={current.city} className="relative animate-[fadeUp_.5s_ease-out]">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0284C7] px-3.5 py-1.5 rounded-full bg-[#0284C7]/10 border border-[#0284C7]/20 mb-6">
              <MapPin size={12} /> {current.type}
            </span>
            <h3 className="font-display font-bold text-4xl sm:text-5xl text-[#082F49] tracking-tight mb-5">
              {current.city}
            </h3>
            <p className="text-sm sm:text-base text-[#4B6584] leading-relaxed">{current.address}</p>
          </div>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(current.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-8 inline-flex items-center justify-center gap-2 w-fit bg-[#082F49] hover:bg-[#0284C7] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors group"
          >
            View Location <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* City switcher — also the accessible / touch-friendly path */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose an office">
          {branches.map((b) => {
            const on = active === b.city;
            return (
              <button
                key={b.city}
                onClick={() => setActive(b.city)}
                aria-pressed={on}
                className={`min-h-11 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] ${
                  on
                    ? "bg-[#082F49] text-white border-[#082F49] shadow-md"
                    : "bg-white/70 text-[#082F49] border-[#0284C7]/20 hover:border-[#0284C7]/50 hover:bg-white"
                }`}
              >
                {b.city}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
