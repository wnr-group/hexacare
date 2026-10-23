'use client'
import { useState } from 'react';
import { Pill } from 'lucide-react';

export default function MedicineImage({ src, alt, className = "" }: { src: string | null | undefined; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-[#EAF6FF] to-sky-100 text-[#0284C7]/50 ${className}`}>
        <Pill size={44} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`bg-white object-contain ${className}`} />
  );
}
