'use client'
import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import ViewMedicinesModal from '@/components/products/ViewMedicinesModal';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Products', href: '/product' },
  { name: 'Contact Us', href: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed w-full z-50 bg-sky-50/90 backdrop-blur-xl border-b border-sky-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[5rem] items-center">
            
            {/* Logo Built with Code */}
            <div className="flex items-center gap-3 cursor-pointer select-none">
              {/* The Icon */}
              <img 
                src="/hexacare-logo.png" 
                alt="Hexacare Icon" 
                className="h-18 w-18 object-contain rounded-full shrink-0" 
              />
              
              {/* The Code-Based Typography */}
              <div className="flex flex-col justify-center pt-1">
                {/* Top Line: Brand Name + TM */}
                <div className="flex items-start">
                  <span className="text-2xl font-black text-[#0050D0] tracking-wide leading-none">
                    HEXACARE
                  </span>
                  <span className="text-[9px] font-bold text-slate-800 ml-0.5 mt-0.5 leading-none">
                    TM
                  </span>
                </div>
                
                {/* Middle Line: Subtitle */}
                <span className="text-[9px] md:text-[10px] font-medium text-slate-500 tracking-[0.08em] mt-1 leading-none">
                  PHARMACEUTICALS PVT. LTD.
                </span>
                
                {/* Divider Line */}
                <div className="w-full border-t border-slate-300 my-1"></div>
                
                {/* Bottom Line: Tagline */}
                <span className="text-[8px] md:text-[9px] font-bold text-slate-600 tracking-[0.18em] leading-none">
                  LIFE SAVING MEDICINE
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-1 lg:space-x-2 items-center">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-[16px] font-medium text-slate-600 rounded-full hover:text-sky-600 hover:bg-white/80 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Sky Blue CTA Button (Desktop) */}
            <div className="hidden md:flex items-center ml-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-sky-500 rounded-full hover:bg-sky-600 shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Explore Products
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 hover:text-sky-600 p-2 rounded-full bg-white shadow-sm border border-sky-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div 
          className={`md:hidden absolute top-full left-0 w-full bg-sky-50/95 backdrop-blur-xl border-b border-sky-100 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
            isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-[16px] font-medium text-slate-600 hover:bg-white/80 hover:text-sky-600 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            {/* Mobile CTA */}
            <div className="pt-4 pb-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 text-sm font-semibold text-white bg-sky-500 rounded-xl hover:bg-sky-600 shadow-md shadow-sky-500/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                Explore Products
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Reusable ViewMedicinesModal */}
      <ViewMedicinesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Navbar;