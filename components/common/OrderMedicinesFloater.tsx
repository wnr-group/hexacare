'use client'
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import OrderMedicinesModal from '@/components/products/OrderMedicinesModal';

export default function OrderMedicinesFloater() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Help label */}
        <div className="hidden sm:flex items-center bg-white text-[#082F49] text-xs font-bold py-2.5 px-4 rounded-full shadow-[0_4px_20px_-5px_rgba(2,132,199,0.25)] border border-sky-150 animate-[floatSlow_4s_ease-in-out_infinite]">
          Fast Sourcing & Ordering
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-r border-t border-sky-150 rotate-45"></div>
        </div>

        {/* Pulse Floater Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center gap-2 px-6 py-4 bg-[#0284C7] hover:bg-[#075985] text-white rounded-full font-bold shadow-[0_4px_20px_rgba(2,132,199,0.4)] hover:shadow-[0_8px_25px_rgba(2,132,199,0.5)] transition-all duration-300 hover:scale-105 active:scale-[0.98] cursor-pointer animate-[pulseGlow_2.5s_infinite_ease-in-out]"
          aria-label="Order Medicines Now"
        >
          {/* Animated glow background */}
          <span className="absolute inset-0 rounded-full bg-[#0284C7] opacity-45 group-hover:scale-110 transition-transform -z-10 animate-ping" />
          <ShoppingCart size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm">Order Medicines Now</span>
        </button>
      </div>

      <OrderMedicinesModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(2,132,199,0.4); }
          50% { box-shadow: 0 4px 30px rgba(2,132,199,0.7); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
