'use client'
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, RotateCcw, X } from 'lucide-react';
import MedicineImage from './MedicineImage';

const MIN = 1;
const MAX = 4;

export default function MedicineGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const resetView = () => { setZoom(1); setPos({ x: 0, y: 0 }); };
  const setZ = useCallback((fn: (z: number) => number) => {
    setZoom((z) => {
      const n = Math.min(MAX, Math.max(MIN, +fn(z).toFixed(2)));
      if (n === MIN) setPos({ x: 0, y: 0 });
      return n;
    });
  }, []);
  const go = useCallback((dir: number) => {
    setActive((a) => (a + dir + images.length) % images.length);
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      else if (e.key === '+' || e.key === '=') setZ((z) => z + 0.5);
      else if (e.key === '-') setZ((z) => z - 0.5);
      else if (e.key === '0') resetView();
      else if (e.key === 'ArrowRight' && images.length > 1) go(1);
      else if (e.key === 'ArrowLeft' && images.length > 1) go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, go, setZ, images.length]);

  const openViewer = (i: number) => { setActive(i); resetView(); setOpen(true); };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom === 1 || (e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
  };
  const onPointerUp = () => { drag.current = null; setDragging(false); };

  const ctrl = 'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3 lg:sticky lg:top-28 lg:mx-0 lg:self-start">
      <button
        type="button"
        onClick={() => openViewer(active)}
        aria-label="Open image full screen"
        className="group relative h-64 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:shadow-lg hover:shadow-sky-500/10 sm:h-72 lg:h-80"
      >
        <MedicineImage key={images[active] ?? 'none'} src={images[active]} alt={alt} className="h-full w-full p-4 transition-transform duration-500 group-hover:scale-105" />
        {images[active] && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#082F49]/80 px-3 py-1.5 text-xs font-semibold text-white opacity-90 backdrop-blur transition group-hover:bg-[#0284C7]">
            <Maximize2 size={13} /> Click to zoom
          </span>
        )}
      </button>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${i === active ? 'border-[#0284C7] shadow-md shadow-sky-500/20' : 'border-sky-100 opacity-70 hover:border-sky-300 hover:opacity-100'}`}
            >
              <MedicineImage src={src} alt="" className="h-full w-full p-1" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${alt} image viewer`} className="fixed inset-0 z-[70] flex flex-col bg-[#031A2B]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="line-clamp-1 text-sm font-semibold text-white/90">
              {alt}{images.length > 1 && <span className="ml-2 text-white/50">{active + 1} / {images.length}</span>}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setZ((z) => z - 0.5)} disabled={zoom <= MIN} aria-label="Zoom out" className={ctrl}><Minus size={18} /></button>
              <span className="w-12 text-center text-sm font-semibold tabular-nums text-white">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZ((z) => z + 0.5)} disabled={zoom >= MAX} aria-label="Zoom in" className={ctrl}><Plus size={18} /></button>
              <button type="button" onClick={resetView} disabled={zoom === 1} aria-label="Reset zoom" className={`${ctrl} hidden sm:flex`}><RotateCcw size={16} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className={`${ctrl} ml-1 bg-white/20`}><X size={20} /></button>
            </div>
          </div>

          <div
            className={`relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden ${zoom > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
            onWheel={(e) => setZ((z) => z - Math.sign(e.deltaY) * 0.25)}
            onDoubleClick={() => (zoom > 1 ? resetView() : setZ(() => 2.5))}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="flex h-full w-full items-center justify-center p-4 sm:p-10"
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`, transition: dragging ? 'none' : 'transform 0.2s ease-out' }}
            >
              <MedicineImage key={images[active]} src={images[active]} alt={alt} className="max-h-full max-w-full select-none rounded-xl bg-white p-3 shadow-2xl" />
            </div>

            {images.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={`${ctrl} absolute left-3 top-1/2 -translate-y-1/2 sm:left-6`}><ChevronLeft size={22} /></button>
                <button type="button" onClick={() => go(1)} aria-label="Next image" className={`${ctrl} absolute right-3 top-1/2 -translate-y-1/2 sm:right-6`}><ChevronRight size={22} /></button>
              </>
            )}
          </div>

          <p className="px-4 py-3 text-center text-xs text-white/50">Scroll or double-click to zoom · drag to pan · Esc to close</p>
        </div>
      )}
    </div>
  );
}
