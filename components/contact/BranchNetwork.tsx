'use client'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Check, Clock, Copy, Crosshair, Loader2, MapPin, Navigation, Pause, Phone, Play } from "lucide-react";
import { useAutoTour } from "./useAutoTour";

/* Opening hours, evaluated in India Standard Time. days: 0 = Sunday … 6 = Saturday. */
export interface BranchHours {
  days: number[];
  open: string; // "HH:MM" 24h
  close: string;
  label: string; // human readable, e.g. "Mon–Sat · 9:30 AM – 6:00 PM"
}

export interface Branch {
  type: string;
  city: string;
  address: string;
  phones?: { label: string; number: string; dial?: string }[]; // dial: digits for tel:, defaults to number
  hours?: BranchHours;
  services?: string[];
}

/* Approximate neighbourhood centres, used for map pins and distance. */
const COORDS: Record<string, [number, number]> = {
  Chennai: [13.0418, 80.2503],
  Coimbatore: [10.9967, 76.9917],
  Trichy: [10.8160, 78.6850],
  Madurai: [9.9230, 78.0990],
  Bengaluru: [12.9116, 77.6389],
};

const ALL = "all";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
};

/* Opening state in IST: open now (+ closing time), or when it next opens. */
function hoursStatus(hours: BranchHours, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = DAYS.indexOf(get("weekday"));
  const mins = Number(get("hour")) * 60 + Number(get("minute"));
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);

  if (hours.days.includes(day) && mins >= open && mins < close) {
    return { open: true, text: `Open now · Closes ${fmtTime(hours.close)}` };
  }
  if (hours.days.includes(day) && mins < open) {
    return { open: false, text: `Closed · Opens ${fmtTime(hours.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (hours.days.includes(d)) {
      return { open: false, text: `Closed · Opens ${i === 1 ? "tomorrow" : DAYS[d]} ${fmtTime(hours.open)}` };
    }
  }
  return { open: false, text: "Closed" };
}

function distanceKm(a: [number, number], b: [number, number]) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const pinHtml = (isHub: boolean, active: boolean) =>
  `<div class="hx-pin ${isHub ? "hx-pin--hub" : ""} ${active ? "hx-pin--active" : ""}"><span class="hx-pin__ping"></span><span class="hx-pin__hex"><i></i></span></div>`;

type GeoState = "idle" | "locating" | "ok" | "denied" | "unsupported" | "error";

export default function BranchNetwork({ branches }: { branches: Branch[] }) {
  const hub = branches[0];
  const [tab, setTab] = useState<string>(ALL);
  const [active, setActive] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const reduced = useRef(false);

  /* Clock is client-only so server and client markup match on first render. */
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  /* Map pin → highlight (and reveal) its card. */
  const onPin = useCallback((city: string) => {
    setTab((t) => (t === ALL || t === city ? t : ALL));
    setActive(city);
    requestAnimationFrame(() =>
      document.getElementById(`branch-card-${city}`)?.scrollIntoView({ block: "nearest", behavior: reduced.current ? "auto" : "smooth" })
    );
  }, []);

  /* ---- Leaflet setup (dynamic import: Leaflet needs `window`) ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapEl.current || mapRef.current) return;
      leaflet.current = L;

      const map = L.map(mapEl.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile,
        attributionControl: true,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const hubLL = COORDS[hub.city];
      branches.forEach((b) => {
        const ll = COORDS[b.city];
        if (!ll) return;
        if (b !== hub && hubLL) {
          L.polyline([hubLL, ll], { color: "#0284C7", weight: 1.5, opacity: 0.55, dashArray: "2 8", className: "hx-route" }).addTo(map);
        }
        const m = L.marker(ll, {
          icon: L.divIcon({ className: "hx-pin-wrap", html: pinHtml(b === hub, false), iconSize: [44, 44], iconAnchor: [22, 22] }),
          title: `${b.city} ${b.type}`,
          keyboard: true,
          alt: `${b.city} ${b.type}`,
        }).addTo(map);
        m.on("click", () => onPin(b.city));
        markers.current[b.city] = m;
      });

      map.fitBounds(L.latLngBounds(Object.values(COORDS)), { padding: [40, 40] });
      mapRef.current = map;
      setMapReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.current = {};
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPin]);

  /* Highlight the active pin and fly to it. */
  useEffect(() => {
    const L = leaflet.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;
    branches.forEach((b) => {
      markers.current[b.city]?.setIcon(
        L.divIcon({ className: "hx-pin-wrap", html: pinHtml(b === hub, b.city === active), iconSize: [44, 44], iconAnchor: [22, 22] })
      );
    });
    if (active && COORDS[active]) {
      if (reduced.current) map.setView(COORDS[active], 11);
      else map.flyTo(COORDS[active], 11, { duration: 1.4 });
    } else {
      const bounds = L.latLngBounds(Object.values(COORDS));
      if (userPos) bounds.extend(userPos);
      map.fitBounds(bounds, { padding: [40, 40], animate: !reduced.current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, mapReady]);

  /* Show the visitor's own position on the map. */
  useEffect(() => {
    const L = leaflet.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map || !userPos) return;
    const me = L.marker(userPos, {
      icon: L.divIcon({ className: "hx-pin-wrap", html: '<span class="hx-me"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      interactive: false,
      keyboard: false,
    }).addTo(map);
    return () => {
      me.remove();
    };
  }, [userPos, mapReady]);

  const distances = useMemo(() => {
    const out: Record<string, number> = {};
    if (userPos) branches.forEach((b) => COORDS[b.city] && (out[b.city] = distanceKm(userPos, COORDS[b.city])));
    return out;
  }, [userPos, branches]);

  const nearest = userPos ? [...branches].sort((a, b) => distances[a.city] - distances[b.city])[0] : null;

  const visible = useMemo(() => {
    const list = tab === ALL ? [...branches] : branches.filter((b) => b.city === tab);
    return userPos ? list.sort((a, b) => distances[a.city] - distances[b.city]) : list;
  }, [tab, branches, userPos, distances]);

  /* ---- Auto tour ---- */
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tourIds = useMemo(() => visible.map((b) => b.city), [visible]);

  const onTourStep = useCallback((city: string) => {
    setActive(city);
    // Scroll only the card list itself — never move the page under the visitor.
    const panel = panelRef.current;
    const card = document.getElementById(`branch-card-${city}`);
    if (panel && card && panel.scrollHeight > panel.clientHeight + 2) {
      panel.scrollTo({ top: Math.max(0, card.offsetTop - panel.offsetTop - 8), behavior: reduced.current ? "auto" : "smooth" });
    }
  }, []);

  const tour = useAutoTour({ ids: tourIds, active, ready: mapReady, onStep: onTourStep });
  const { interrupt, setInView, setHovering } = tour;

  /* Only tour while the section is on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [setInView]);

  /* Any press / key on the map (pins, controls, dragging) is a manual action. */
  useEffect(() => {
    const el = mapEl.current;
    if (!el) return;
    el.addEventListener("pointerdown", interrupt);
    el.addEventListener("keydown", interrupt);
    return () => {
      el.removeEventListener("pointerdown", interrupt);
      el.removeEventListener("keydown", interrupt);
    };
  }, [interrupt]);

  const mouseHover = (on: boolean) => (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") setHovering(on);
  };

  const selectTab = useCallback(
    (t: string) => {
      interrupt();
      setTab(t);
      setActive(t === ALL ? null : t);
    },
    [interrupt]
  );

  const tabs = [ALL, ...branches.map((b) => b.city)];
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + step + tabs.length) % tabs.length;
    selectTab(tabs[next]);
    document.getElementById(`branch-tab-${tabs[next]}`)?.focus();
  };

  /* ---- Nearest branch ---- */
  const locate = () => {
    interrupt();
    if (!("geolocation" in navigator)) return setGeo("unsupported");
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const closest = branches.reduce((a, b) => (distanceKm(here, COORDS[b.city]) < distanceKm(here, COORDS[a.city]) ? b : a));
        setUserPos(here);
        setGeo("ok");
        setTab(ALL);
        setActive(closest.city);
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  };

  const copyAddress = async (b: Branch) => {
    try {
      await navigator.clipboard.writeText(b.address);
      setCopied(b.city);
      setTimeout(() => setCopied((c) => (c === b.city ? null : c)), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const geoMessage: Record<GeoState, string> = {
    idle: "",
    locating: "Finding your location…",
    ok: nearest ? `Nearest to you: ${nearest.city} · ${distances[nearest.city].toFixed(1)} km away` : "",
    denied: "Location access was blocked. You can still pick a city above.",
    unsupported: "Your browser doesn't support location. Please pick a city above.",
    error: "We couldn't find your location. Please pick a city above.",
  };

  return (
    <div ref={rootRef} className="space-y-8">
      <style>{`
        @keyframes hx-flow { to { stroke-dashoffset: -20; } }
        @keyframes hx-ping { 0% { transform: scale(.7); opacity: .6; } 100% { transform: scale(2.1); opacity: 0; } }
        @keyframes hx-tour { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .hx-tour-bar { animation: hx-tour 5s linear forwards; }
        @keyframes hx-card-in { from { opacity: 0; transform: translateY(18px) scale(.985); } to { opacity: 1; transform: none; } }
        @keyframes hx-beat { 0% { stroke-dashoffset: 1; } 70%,100% { stroke-dashoffset: 0; } }
        @keyframes hx-blip { 0%,100% { opacity: .25; } 50% { opacity: 1; } }

        .hx-card-in { animation: hx-card-in .6s cubic-bezier(.2,.8,.2,1) both; }
        .hx-route { animation: hx-flow 1.4s linear infinite; }
        .hx-beat { stroke-dasharray: 1; stroke-dashoffset: 1; animation: hx-beat 3.2s ease-in-out infinite; }

        .hx-pin-wrap { background: none; border: 0; }
        .hx-pin { position: relative; width: 44px; height: 44px; display: grid; place-items: center; cursor: pointer; }
        .hx-pin__hex, .hx-pin__ping { position: absolute; clip-path: polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%); }
        .hx-pin__hex { width: 28px; height: 28px; background: #0284C7; display: grid; place-items: center; transition: transform .3s, background .3s, width .3s, height .3s; filter: drop-shadow(0 4px 6px rgba(8,47,73,.35)); }
        .hx-pin__hex i { width: 10px; height: 10px; background: #fff; clip-path: polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%); }
        .hx-pin--hub .hx-pin__hex { width: 36px; height: 36px; background: #082F49; }
        .hx-pin--hub .hx-pin__hex i { background: #22D3EE; }
        .hx-pin:hover .hx-pin__hex { transform: scale(1.15); }
        .hx-pin__ping { width: 28px; height: 28px; background: #22D3EE; opacity: 0; }
        .hx-pin--active .hx-pin__hex { background: #22D3EE; transform: scale(1.25); }
        .hx-pin--active .hx-pin__hex i { background: #082F49; }
        .hx-pin--active .hx-pin__ping { animation: hx-ping 2.2s ease-out infinite; }
        .hx-me { display: block; width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(37,99,235,.25); }

        .hx-map .leaflet-tile-pane { filter: saturate(.75) hue-rotate(-6deg) brightness(1.02); }
        .hx-map .leaflet-control-attribution { font-size: 10px; background: rgba(255,255,255,.75); backdrop-filter: blur(6px); border-top-left-radius: 8px; }
        .hx-map .leaflet-bar { border: 0; box-shadow: 0 6px 20px -6px rgba(8,47,73,.35); border-radius: 14px; overflow: hidden; }
        .hx-map .leaflet-bar a { color: #082F49; }

        @media (prefers-reduced-motion: reduce) {
          .hx-card-in, .hx-route, .hx-beat, .hx-pin--active .hx-pin__ping { animation: none !important; }
          .hx-beat { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* ---- Tabs + locate ---- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter offices by city"
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((t, i) => {
            const on = tab === t;
            return (
              <button
                key={t}
                id={`branch-tab-${t}`}
                role="tab"
                aria-selected={on}
                aria-controls="branch-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => selectTab(t)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`shrink-0 min-h-11 px-5 rounded-full text-sm font-semibold border transition-all duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] ${
                  on
                    ? "bg-[#082F49] text-white border-[#082F49] shadow-lg shadow-[#082F49]/25"
                    : "bg-white/70 text-[#082F49] border-[#0284C7]/20 hover:border-[#0284C7]/50 hover:bg-white"
                }`}
              >
                {t === ALL ? `All offices · ${branches.length}` : t}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={tour.toggle}
          aria-pressed={tour.enabled}
          className={`shrink-0 inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-full text-sm font-semibold border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7] ${
            tour.enabled ? "bg-white text-[#082F49] border-[#0284C7]/40" : "bg-white/60 text-[#4B6584] border-[#0284C7]/20"
          }`}
        >
          {tour.enabled ? <Pause size={15} /> : <Play size={15} />}
          Auto tour: {tour.enabled ? "On" : "Off"}
        </button>
        <button
          onClick={locate}
          disabled={geo === "locating"}
          className="shrink-0 inline-flex items-center justify-center gap-2.5 min-h-11 px-5 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] text-[#041B2D] text-sm font-bold shadow-[0_10px_30px_-10px_rgba(14,165,233,.8)] hover:shadow-[0_14px_36px_-8px_rgba(14,165,233,.9)] transition-shadow disabled:opacity-70 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
        >
          {geo === "locating" ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
          Find my nearest branch
        </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className={`text-sm -mt-4 min-h-5 ${geo === "ok" ? "text-[#0284C7] font-semibold" : "text-[#4B6584]"}`}>
        {geoMessage[geo]}
      </p>

      {/* ---- Heartbeat divider ---- */}
      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#0284C7]/30" />
        <svg viewBox="0 0 240 40" className="w-44 sm:w-60 h-8 overflow-visible">
          <path d="M0 20 H78 L88 20 L96 6 L108 36 L118 12 L124 20 H240" fill="none" stroke="#0284C7" strokeOpacity="0.15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0 20 H78 L88 20 L96 6 L108 36 L118 12 L124 20 H240" pathLength="1" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hx-beat" />
        </svg>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#0284C7]/30" />
      </div>

      {/* ---- Split: map | cards ---- */}
      <div
        className="grid lg:grid-cols-12 gap-6 items-start"
        onPointerEnter={mouseHover(true)}
        onPointerLeave={mouseHover(false)}
      >
        <div className="lg:col-span-7 lg:sticky lg:top-28 relative rounded-[2.5rem] overflow-hidden border border-[#0284C7]/20 shadow-2xl bg-[#DCEFFB]">
          <div
            ref={mapEl}
            className="hx-map h-[340px] sm:h-[420px] lg:h-[620px] w-full z-0"
            role="region"
            aria-label="Interactive map of HexaCare offices. Branch details are listed in the cards."
          />
          <div className="pointer-events-none absolute top-4 left-4 z-[400] flex items-center gap-2 rounded-full bg-[#082F49]/90 backdrop-blur px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#22D3EE]">
            <MapPin size={12} /> {branches.length} hubs · South India
          </div>
        </div>

        <div
          ref={panelRef}
          id="branch-panel"
          role="tabpanel"
          aria-labelledby={`branch-tab-${tab}`}
          className="lg:col-span-5 lg:max-h-[620px] lg:overflow-y-auto lg:pr-2 space-y-4 [scrollbar-width:thin]"
        >
          <p className="sr-only" aria-live="polite">{visible.length} {visible.length === 1 ? "office" : "offices"} shown</p>
          <p className="sr-only" role="status" aria-live="polite">
            {active ? `Showing ${active} ${branches.find((b) => b.city === active)?.type ?? ""} on the map` : ""}
          </p>
          {visible.map((b, idx) => {
            const isHub = b === hub;
            const isActive = active === b.city;
            const status = b.hours && now ? hoursStatus(b.hours, now) : null;
            const isNearest = nearest?.city === b.city;
            return (
              <article
                key={`${tab}-${b.city}`}
                id={`branch-card-${b.city}`}
                aria-current={isActive}
                onClick={() => {
                  interrupt();
                  setActive(b.city);
                }}
                style={{ animationDelay: `${idx * 90}ms` }}
                className={`hx-card-in group relative rounded-[1.75rem] p-6 border cursor-pointer transition-all duration-500 hover:-translate-y-1.5 ${
                  isHub ? "bg-[#082F49] text-white" : "bg-white text-[#082F49]"
                } ${
                  isActive
                    ? "border-[#22D3EE] shadow-[0_24px_50px_-20px_rgba(2,132,199,.6)] ring-2 ring-[#22D3EE]/40"
                    : "border-[#0284C7]/15 shadow-sm hover:shadow-[0_24px_50px_-24px_rgba(2,132,199,.5)] hover:border-[#0284C7]/40"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${isHub ? "text-[#22D3EE] bg-white/5 border-white/10" : "text-[#0284C7] bg-[#0284C7]/10 border-[#0284C7]/20"}`}>
                    <MapPin size={11} /> {b.type}
                  </span>
                  {isNearest && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#22D3EE] text-[#041B2D]">
                      <Crosshair size={11} /> Nearest to you
                    </span>
                  )}
                  {status && (
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${status.open ? (isHub ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-500/10 text-emerald-700") : isHub ? "bg-white/10 text-[#9DC8E6]" : "bg-slate-100 text-slate-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.open ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {status.text}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display font-extrabold text-2xl tracking-tight">{b.city}</h3>
                  {distances[b.city] !== undefined && (
                    <span className={`text-xs font-bold whitespace-nowrap ${isHub ? "text-[#22D3EE]" : "text-[#0284C7]"}`}>
                      {distances[b.city].toFixed(1)} km away
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm leading-relaxed ${isHub ? "text-[#9DC8E6]" : "text-[#4B6584]"}`}>{b.address}</p>

                {b.phones && b.phones.length > 0 && (
                  <ul className={`mt-3 space-y-1 text-sm ${isHub ? "text-[#BFE3F7]" : "text-[#082F49]"}`}>
                    {b.phones.map((ph) => (
                      <li key={ph.number} className="flex items-center gap-2">
                        <Phone size={14} className="text-[#0284C7] shrink-0" />
                        <span className="opacity-70">{ph.label}</span>
                        <a href={`tel:${(ph.dial ?? ph.number).replace(/[^+\d]/g, "")}`} className="font-semibold hover:underline">{ph.number}</a>
                      </li>
                    ))}
                  </ul>
                )}

                {b.hours && (
                  <p className={`mt-3 flex items-center gap-2 text-sm ${isHub ? "text-[#BFE3F7]" : "text-[#082F49]"}`}>
                    <Clock size={14} className="text-[#0284C7] shrink-0" /> {b.hours.label}
                  </p>
                )}

                {b.services && b.services.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Services at ${b.city}`}>
                    {b.services.map((s) => (
                      <li key={s} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isHub ? "bg-white/10 text-[#BFE3F7]" : "bg-[#EAF6FF] text-[#0369A1]"}`}>{s}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  {b.phones?.map((ph, pi) => (
                    <a
                      key={ph.number}
                      href={`tel:${(ph.dial ?? ph.number).replace(/[^+\d]/g, "")}`}
                      aria-label={`Call ${b.city} ${ph.label} ${ph.number}`}
                      className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-bold transition-colors ${pi === 0 ? (isHub ? "bg-[#22D3EE] text-[#041B2D] hover:bg-white" : "bg-[#082F49] text-white hover:bg-[#0284C7]") : isHub ? "border border-white/20 text-white hover:bg-white/10" : "border border-[#082F49]/20 text-[#082F49] hover:bg-[#EAF6FF]"}`}
                    >
                      <Phone size={15} /> {b.phones!.length > 1 ? ph.label : "Call"}
                    </a>
                  ))}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-bold transition-colors ${b.phones?.length ? (isHub ? "border border-white/20 text-white hover:bg-white/10" : "border border-[#082F49]/20 text-[#082F49] hover:bg-[#EAF6FF]") : isHub ? "bg-[#22D3EE] text-[#041B2D] hover:bg-white" : "bg-[#082F49] text-white hover:bg-[#0284C7]"}`}
                  >
                    <Navigation size={15} /> Get Directions
                  </a>
                  <button
                    onClick={() => copyAddress(b)}
                    className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full text-sm font-bold border transition-colors cursor-pointer ${isHub ? "border-white/20 text-white hover:bg-white/10" : "border-[#082F49]/20 text-[#082F49] hover:bg-[#EAF6FF]"}`}
                  >
                    {copied === b.city ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                    <span aria-live="polite">{copied === b.city ? "Copied" : "Copy Address"}</span>
                  </button>
                </div>
                {tour.running && isActive && (
                  <span aria-hidden="true" className="absolute left-6 right-6 bottom-0 h-[3px] rounded-full bg-[#22D3EE]/20 overflow-hidden">
                    <span key={active} className="hx-tour-bar block h-full origin-left bg-[#22D3EE]" style={{ animationDuration: `${tour.stepMs}ms` }} />
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
