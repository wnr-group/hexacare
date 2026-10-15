'use client'
import { useState } from 'react';
import MedicineImage from './MedicineImage';

export default function MedicineGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
        <MedicineImage key={images[active] ?? 'none'} src={images[active]} alt={alt} className="h-full w-full p-6" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${i === active ? 'border-[#0284C7]' : 'border-sky-100 hover:border-sky-300'}`}
            >
              <MedicineImage src={src} alt="" className="h-full w-full p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
